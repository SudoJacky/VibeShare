import type { Metadata } from "next";
import { Presentation } from "../presentation";

export const dynamic = "force-static";

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
