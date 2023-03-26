import React, { useEffect, useContext } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { MenuProps, notification } from "antd";
import { Layout, Menu, theme, Button } from "antd";
import { Typography } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import AuthButton from "./AuthButton";
// import { useSigner } from "wagmi";

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

interface IProp {
  children: React.ReactNode;
}

const CustomLayout = ({ children }: IProp) => {
  const { authState, signIn, signOut } = useContext(AuthContext);
  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  // const { data: signer } = useSigner();
  // const [signerAddress, setSignerAddress] = React.useState<string | null>(null);
  const [optionNames, setOptionNames] = React.useState([
    "Dashboard",
    "Propose an Investment",
    "View Project Proposals",
    "Logout",
  ]);
  const [optionRoutes, setOptionRoutes] = React.useState([
    "/dashboard",
    "/propose-investment",
    "/view-project-proposals",
    "/logout",
  ]);
  const [iconsList, setIconsList] = React.useState([
    DashboardOutlined,
    LaptopOutlined,
    NotificationOutlined,
    LogoutOutlined,
  ]);

  // TODO -> CHECK IF THIS LOGIC IS OF ANY USE OR NOT
  // useEffect(() => {
  //   const isLoggedIn = localStorage.getItem("isLoggedIn");
  //   if (isLoggedIn === "true") {
  //     setIsLoggedIn(true);
  //   }
  //   const isCompany = localStorage.getItem("isCompany") === "true";
  //   setIsCompany(isCompany);
  //   const isEmployee = localStorage.getItem("isEmployee") === "true";
  //   setIsEmployee(isEmployee);
  // }, []);

  // useEffect(() => {
  //   if (isLoggedIn) {
  //     if (isCompany) {
  //       setOptionNames([
  //         "Dashboard",
  //         "Propose an Investment",
  //         "View Investment Proposals",
  //       ]);
  //       setOptionRoutes([
  //         "/dashboard",
  //         "/propose-investment",
  //         "/view-investment-proposals",
  //       ]);
  //       setIconsList([DashboardOutlined, LaptopOutlined, NotificationOutlined]);
  //     } else {
  //       setOptionNames(["Dashboard"]);
  //       setOptionRoutes(["/dashboard"]);
  //       setIconsList([DashboardOutlined]);
  //     }
  //   } else {
  //     setOptionNames(["Register Company"]);
  //     setOptionRoutes(["/register-company"]);
  //     setIconsList([UserOutlined]);
  //   }
  // }, [isLoggedIn, isCompany, isEmployee]);

  // useEffect(() => {
  //   const getSignerAddress = async () => {
  //     const address = await signer?.getAddress();
  //     setSignerAddress(address);
  //   };
  //   getSignerAddress();
  // }, [signer]);

  const items2: MenuProps["items"] = iconsList.map((icon, index) => {
    const key: String = String(index + 1);

    return {
      key: `${key}`,
      icon: React.createElement(icon),
      label: optionNames[index],
      onClick: () => {
        // navigate to the route
        if (optionRoutes[index] === "/logout") {
          signOut();
          localStorage.clear();
          notification.success({ message: "Logged out successfully" });
          router.push("/");
        } else router.push(optionRoutes[index]);
      },
    };
  });

  return (
    <Layout style={{ height: "100vh", overflowY: "clip" }}>
      <Header className="header" style={{ padding: "35px 20px" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Link href="/">
            <Title style={{ color: "white", marginTop: 8 }} level={2}>
              DTender
            </Title>
          </Link>
          <div style={{ display: "flex", alignItems: "center" }}>
            <AuthButton authState={authState} signIn={signIn} />
          </div>
        </div>
      </Header>
      <Layout>
        <Sider
          width={250}
          style={{ background: colorBgContainer }}
          theme="dark"
          collapsible
        >
          <Menu
            mode="inline"
            defaultOpenKeys={["1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
            theme="dark"
          ></Menu>
        </Sider>
        <Layout style={{ padding: "20px", overflowY: "auto" }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              overflow: "scroll",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;
