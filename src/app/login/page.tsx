'use client';

import { Button, Container, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

import { login } from '@/app/api/actions';

import classes from './page.module.css';

export default function Page() {
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  });

  return (
    <Container size="xs" className={classes.container}>
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={2} ta="center" mb={20}>
          Welcome Back
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb={30}>
          Please sign in to continue
        </Text>

        <form
          onSubmit={form.onSubmit((values) => {
            const formData = new FormData();
            formData.append('username', values.username);
            formData.append('password', values.password);
            login(formData);
          })}
        >
          <TextInput
            label="Username"
            placeholder="Enter your username"
            required
            {...form.getInputProps('username')}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            required
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
