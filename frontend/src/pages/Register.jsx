import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  Link as MuiLink,
  MenuItem,
} from "@mui/material";
import { register, clearError } from "../store/slices/authSlice";

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required")
    .trim(),
  password: Yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  role: Yup.string()
    .oneOf(["customer", "merchant"], "Invalid role")
    .required("Role is required"),
});

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === "merchant") {
        navigate("/merchant/dashboard");
      } else {
        navigate("/menu");
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = (values) => {
    dispatch(register(values));
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{ mb: 3 }}
        >
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            role: "customer",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Field name="name">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Name"
                    type="text"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    margin="normal"
                  />
                )}
              </Field>

              <Field name="email">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    margin="normal"
                  />
                )}
              </Field>

              <Field name="password">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type="password"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    margin="normal"
                  />
                )}
              </Field>

              <Field name="role">
                {({ field, meta }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Role"
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    margin="normal"
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="merchant">Merchant</MenuItem>
                  </TextField>
                )}
              </Field>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading || isSubmitting}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </Form>
          )}
        </Formik>

        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography variant="body2">
            Already have an account?{" "}
            <MuiLink component={Link} to="/login" color="primary">
              Login here
            </MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
