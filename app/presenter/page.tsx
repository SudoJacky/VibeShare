import type { Metadata } from "next";
import { Presentation } from "../presentation";

export const metadata: Metadata = {
  title: "演讲者视图",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PresenterPage() {
  return <Presentation mode="presenter" />;
}
