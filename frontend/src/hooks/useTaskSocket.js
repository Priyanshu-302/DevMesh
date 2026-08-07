import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { taskSocket } from '../sockets/taskSocket';
import { TASK_EVENTS } from '../sockets/eventTypes';
import { AGENT_COLORS } from '../utils/constants';
import { taskApi } from '../api/taskApi';

export function useTaskSocket(taskId, initialStatus) {
  const { socket } = useContext(SocketContext);
  const [logs, setLogs]           = useState([]);
  const [status, setStatus]       = useState(initialStatus || 'pending');
  const [qaResult, setQaResult]   = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Sync status when initialStatus loads
  useEffect(() => {
    if (initialStatus) {
      setStatus(initialStatus);
    }
  }, [initialStatus]);

  // Load historical logs
  useEffect(() => {
    if (!taskId) return;
    taskApi.getLogs(taskId)
      .then(res => {
        const dbLogs = res.data || [];
        const mappedLogs = dbLogs.map(l => {
          const eventType = l.eventType;
          const p = l.payload?.data || l.payload;
          const ts = l.timestamp ? new Date(l.timestamp).getTime() : Date.now();
          switch (eventType) {
            case TASK_EVENTS.ARCHITECT_STARTED:
              return { agent: 'architect', color: AGENT_COLORS.architect, text: 'Started planning…', ts };
            case TASK_EVENTS.ARCHITECT_PLAN:
              return { agent: 'architect', color: AGENT_COLORS.architect, text: p?.plan || 'Plan drafted.', ts };
            case TASK_EVENTS.DEVELOPER_STARTED:
              return { agent: 'developer', color: AGENT_COLORS.developer, text: 'Started building…', ts };
            case TASK_EVENTS.DEVELOPER_CODE_CHUNK:
              return {
                agent: 'developer',
                color: AGENT_COLORS.developer,
                text: `Updated file: ${p?.filePath}`,
                file: p?.filePath,
                diff: p?.diff,
                ts
              };
            case TASK_EVENTS.QA_STARTED:
              return { agent: 'qa', color: AGENT_COLORS.qa, text: 'Running inspection…', ts };
            case TASK_EVENTS.QA_RESULT:
              return {
                agent: 'qa',
                color: AGENT_COLORS.qa,
                text: p?.passed ? 'All checks passed ✓' : `${p?.failed ?? '?'} check(s) failed — retrying`,
                ts
              };
            case TASK_EVENTS.TASK_COMPLETED:
              return { agent: 'system', color: '#c8d0e0', text: 'Task complete.', ts };
            case TASK_EVENTS.TASK_FAILED:
              return { agent: 'system', color: '#c8d0e0', text: 'Task failed.', ts };
            default:
              return null;
          }
        }).filter(Boolean);
        setLogs(mappedLogs);

        // Extract historical QA results
        const qaEvents = dbLogs.filter(l => l.eventType === TASK_EVENTS.QA_RESULT);
        if (qaEvents.length > 0) {
          const lastQa = qaEvents[qaEvents.length - 1].payload;
          const lastQaPayload = lastQa?.data || lastQa;
          setQaResult(lastQaPayload);
          setRetryCount(qaEvents.filter(l => {
            const p = l.payload?.data || l.payload;
            return !p?.passed;
          }).length);
        }
      })
      .catch(err => console.error("Failed to load historical logs:", err));
  }, [taskId]);

  useEffect(() => {
    if (!socket || !taskId) return;
    taskSocket.joinTaskRoom(taskId);

    const push = (agent, text, file, diff) =>
      setLogs(prev => [...prev, { agent, color: AGENT_COLORS[agent] || '#c8d0e0', text, file, diff, ts: Date.now() }]);

    socket.on(TASK_EVENTS.ARCHITECT_STARTED,    ()  => { setStatus('running'); push('architect', 'Started planning…'); });
    socket.on(TASK_EVENTS.ARCHITECT_PLAN,       (d) => {
      const payload = d?.data || d;
      push('architect', payload?.plan || 'Plan drafted.');
    });
    socket.on(TASK_EVENTS.DEVELOPER_STARTED,    ()  => push('developer', 'Started building…'));
    socket.on(TASK_EVENTS.DEVELOPER_CODE_CHUNK, (d) => {
      const payload = d?.data || d;
      push('developer', `Updated file: ${payload?.filePath}`, payload?.filePath, payload?.diff);
    });
    socket.on(TASK_EVENTS.QA_STARTED,           ()  => push('qa', 'Running inspection…'));
    socket.on(TASK_EVENTS.QA_RESULT,            (d) => {
      const payload = d?.data || d;
      setQaResult(payload);
      if (!payload?.passed) setRetryCount(c => c + 1);
      push('qa', payload?.passed ? 'All checks passed ✓' : `${payload?.failed ?? '?'} check(s) failed — retrying`);
    });
    socket.on(TASK_EVENTS.TASK_COMPLETED, () => { setStatus('completed'); push('system', 'Task complete.'); });
    socket.on(TASK_EVENTS.TASK_FAILED,    () => { setStatus('failed');    push('system', 'Task failed.'); });

    return () => {
      taskSocket.leaveTaskRoom(taskId);
      Object.values(TASK_EVENTS).forEach(ev => socket.off(ev));
    };
  }, [socket, taskId]);

  return { logs, status, qaResult, retryCount };
}
