import AuthForms from "@/components/sections/Auth/Forms";
import CaptchaProvider from "@/components/providers/CaptchaProvider";
import { siteConfig } from "@/config/site";
import { Metadata, NextPage } from "next";

export const metadata: Metadata = {
  title: `Chào mừng bạn trở lại CineVerse ${siteConfig.name}`,
};

const AuthPage: NextPage = () => {
  return (
    <CaptchaProvider>
      <AuthForms />
    </CaptchaProvider>
  );
};

export default AuthPage;
