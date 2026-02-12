import { createTheme, InputWrapper } from "@mantine/core";
import type { ThemeConfig } from "antd";

export const mantineTheme = createTheme({
  fontFamily: "Heebo, sans-serif",
  headings: { fontFamily: "Heebo, sans-serif" },
  components: {
    InputWrapper: InputWrapper.extend({
      styles: {
        label: {
          width: "100%",
          textAlign: "right",
          fontWeight: "400",
        },
      },
    }),
  },
});

export const antdTheme: ThemeConfig = {
  token: {
    fontFamily: "Heebo, sans-serif",
  },

};
