import { Box, Heading, Text } from "@chakra-ui/react";

export function App(): React.ReactElement {
  return (
    <Box p={8}>
      <Heading size="2xl">Hello World</Heading>
      <Text mt={2} color="gray.600">
        creatures client is alive
      </Text>
    </Box>
  );
}
