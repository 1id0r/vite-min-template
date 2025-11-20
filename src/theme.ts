import { createTheme, InputWrapper } from "@mantine/core";

export const theme = createTheme({
  components: {
    InputWrapper: InputWrapper.extend({
      styles: {
        label: {
          width: "100%",
          textAlign: "right",
        },
      },
    }),
  },
});
