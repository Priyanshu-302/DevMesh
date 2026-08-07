import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }

    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }

      const res = await authApi.updateProfile(payload);
      // Update global context state
      setUser(res.data);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="page-content" style={{ maxWidth: 650 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1 }}>
          User Profile
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6, fontFamily: 'var(--font-mono)' }}>
          Manage your personal details and account preferences
        </p>
      </div>

      {/* Hazard divider */}
      <div className="hazard-stripe" style={{ height: 2, marginBottom: 28, borderRadius: 1 }} />

      <div className="glass-panel" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Read-only account info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 1.5 }}>
                Account Created
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--steel)', marginTop: 4 }}>
                {memberSince}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 1.5 }}>
                Role
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--orange)', marginTop: 4, fontWeight: 700 }}>
                DEVELOPER
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="dm-label">Full Name</label>
            <input
              type="text"
              required
              className="dm-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="dm-label">Email Address</label>
            <input
              type="email"
              required
              className="dm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password Fields */}
          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: 16, marginTop: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: 1.5, marginBottom: 12 }}>
              Change Password (optional)
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="dm-label">New Password</label>
                <input
                  type="password"
                  className="dm-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                />
              </div>

              {password && (
                <div>
                  <label className="dm-label">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="dm-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Success / Error Messages */}
          {success && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)', padding: '10px 14px', background: 'rgba(0, 255, 65, 0.05)', borderRadius: 4, border: '1px solid rgba(0, 255, 65, 0.2)' }}>
              ✓ Profile updated successfully!
            </div>
          )}
          {error && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', padding: '10px 14px', background: 'rgba(255, 68, 68, 0.05)', borderRadius: 4, border: '1px solid rgba(255, 68, 68, 0.2)' }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="submit" disabled={saving} style={{ padding: '10px 24px' }}>
              {saving ? 'Saving changes…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
