import useCurrentUser from "../../hooks/useCurrentUser";
import { CreateIspoForm } from "../../components/CreateIspoForm";
import { Container } from "@mui/material";

export default function CreateIspoPage() {
  const { addr } = useCurrentUser();

  return (
    <Container maxWidth="sm">
      <CreateIspoForm />
    </Container>
  );
}
