import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockResetOutlinedIcon from '@material-ui/icons/LockOutlined';
import MailOutlineRoundedIcon from '@material-ui/icons/MailOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || '';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link component={RouterLink} color="inherit" to="/">
        SynCode
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  myclass: {
    paddingTop: theme.spacing(6),
    paddingLeft: '0',
    paddingRight: '0',
  },
  paper: {
    marginTop: theme.spacing(0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: '#007acc',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  submit: {
    margin: theme.spacing(2.5, 0, 1.5),
    backgroundColor: '#007acc',
    '&:hover': {
      backgroundColor: '#005999',
    },
  },
  infoBanner: {
    backgroundColor: '#e6f4ff',
    border: '1px solid #91caff',
    borderRadius: '8px',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
  },
  codeField: {
    '& input': {
      letterSpacing: '4px',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
}));

export default function ForgotPassword() {
  const classes = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  // Step 1 = Request Code; Step 2 = Verify Code & Reset Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Request Code
  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      enqueueSnackbar('Please enter your email address', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }

      enqueueSnackbar(data.message || 'Verification code sent to your email!', {
        variant: 'success',
      });

      setStep(2);
      setResendCooldown(60);
    } catch (error) {
      enqueueSnackbar(error.message || 'Error connecting to server', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!code || !code.trim()) {
      enqueueSnackbar('Please enter the 6-digit verification code', { variant: 'warning' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      enqueueSnackbar('New password must be at least 6 characters', { variant: 'warning' });
      return;
    }

    if (newPassword !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      enqueueSnackbar('Password reset successfully! You can now sign in.', {
        variant: 'success',
      });

      setTimeout(() => {
        history.push('/login');
      }, 1200);
    } catch (error) {
      enqueueSnackbar(error.message || 'Error resetting password', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resend code handler
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      enqueueSnackbar('New verification code sent to your email!', {
        variant: 'success',
      });
      setResendCooldown(60);
    } catch (error) {
      enqueueSnackbar(error.message || 'Error resending code', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.myclass}>
        <div
          className="mt-2 p-0 px-3 pb-3 bg-light w-100 pt-4"
          style={{ borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockResetOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" style={{ fontWeight: 600 }}>
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </Typography>

            {step === 1 ? (
              <form className={classes.form} noValidate onSubmit={handleSendCode}>
                <Typography variant="body2" color="textSecondary" align="center" style={{ marginBottom: 16 }}>
                  Enter your registered email address and we'll send you a 6-digit verification code to reset your password.
                </Typography>

                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Registered Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading || !email.trim()}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Verification Code'}
                </Button>

                <Grid container justify="center" style={{ marginTop: 8 }}>
                  <Grid item>
                    <Link component={RouterLink} to="/login" variant="body2" style={{ color: '#007acc' }}>
                      Remember your password? Sign In
                    </Link>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <form className={classes.form} noValidate onSubmit={handleResetPassword}>
                <div className={classes.infoBanner}>
                  <MailOutlineRoundedIcon style={{ color: '#007acc', marginRight: 8, marginTop: 2 }} />
                  <div style={{ width: '100%' }}>
                    <Typography variant="body2" style={{ color: '#002b4d', fontWeight: 600 }}>
                      Check your email
                    </Typography>
                    <Typography variant="body2" style={{ color: '#003a66', fontSize: '0.85rem' }}>
                      We sent a 6-digit verification code to <strong>{email}</strong>. Please enter the code below to set your new password.
                    </Typography>
                    {previewUrl && (
                      <div style={{ marginTop: 6 }}>
                        <Link
                          href={previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          style={{ color: '#007acc', fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          🔗 Click here to preview the email & code in browser
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      className={classes.codeField}
                      variant="outlined"
                      required
                      fullWidth
                      id="code"
                      label="6-Digit Verification Code"
                      name="code"
                      autoFocus
                      inputProps={{ maxLength: 6 }}
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show Password"
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  disabled={loading || !code || !newPassword || !confirmPassword}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>

                <Grid container justify="space-between" style={{ marginTop: 8 }}>
                  <Grid item>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setStep(1)}
                      style={{ color: '#666', textDecoration: 'underline' }}
                    >
                      Change email
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || loading}
                      style={{
                        color: resendCooldown > 0 ? '#999' : '#007acc',
                        cursor: resendCooldown > 0 ? 'default' : 'pointer',
                      }}
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </Link>
                  </Grid>
                </Grid>

                <Box mt={2} textAlign="center">
                  <Link component={RouterLink} to="/login" variant="body2" style={{ color: '#007acc' }}>
                    Back to Sign In
                  </Link>
                </Box>
              </form>
            )}
          </div>
          <Box mt={4}>
            <Copyright />
          </Box>
        </div>
      </div>
    </Container>
  );
}
