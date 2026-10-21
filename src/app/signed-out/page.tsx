import { DeviceSignedOut } from "@/components/device-signed-out";
import { DEVICE_LIMIT } from "@/lib/device-limit.server";

export const metadata = {
  title: "Signed out on this device",
  robots: { index: false, follow: false },
};

export default function SignedOutPage() {
  return <DeviceSignedOut limit={DEVICE_LIMIT} />;
}
