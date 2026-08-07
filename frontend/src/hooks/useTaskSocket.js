import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { taskSocket } from '../sockets/taskSocket';
import { TASK_EVENTS } from '../sockets/eventTypes';
import { AGENT_COLORS } from '../utils/constants';

export function useTaskSocket(taskId) {
  const { socket } = useContext(SocketContext);
  const [logs, setLogs]           = useState([]);
  const [status, setStatus]       = useState('pending');
  const [qaResult, setQaResult]   = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!socket || !taskId) return;
    taskSocket.joinTaskRoom(taskId);

    const push = (agent, text) =>
      setLogs(prev => [...prev, { agent, color: AGENT_COLORS[agent] || '#c8d0e0', text, ts: Date.now() }]);

    socket.on(TASK_EVENTS.ARCHITECT_STARTED,    ()  => { setStatus('running'); push('architect', 'Started planning…'); });
    socket.on(TASK_EVENTS.ARCHITECT_PLAN,       (d) => push('architect', d?.plan || 'Plan drafted.'));
    socket.on(TASK_EVENTS.DEVELOPER_STARTED,    ()  => push('developer', 'Started building…'));
    socket.on(TASK_EVENTS.DEVELOPER_CODE_CHUNK, (d) => push('developer', d?.chunk || ''));
    socket.on(TASK_EVENTS.QA_STARTED,           ()  => push('qa', 'Running inspection…'));
    socket.on(TASK_EVENTS.QA_RESULT,            (d) => {
      setQaResult(d);
      if (!d?.passed) setRetryCount(c => c + 1);
      push('qa', d?.passed ? 'All checks passed ✓' : `${d?.failed ?? '?'} check(s) failed — retrying`);
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
