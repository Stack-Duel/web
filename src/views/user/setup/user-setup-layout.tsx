import { Card, CardContent } from "@/shared/components/ui/card";
import Layout from "@/shared/layouts/layout/layout";
import UserSetupFormBoundary from "./user-setup-form-boundary";

export default function UserSetupLayout() {
  return (
    <Layout mainClassName="flex justify-center items-center pt-32 pb-9 px-2">
      <Card className="max-w-xl w-full">
        <CardContent>
          <UserSetupFormBoundary />
        </CardContent>
      </Card>
    </Layout>
  );
}
