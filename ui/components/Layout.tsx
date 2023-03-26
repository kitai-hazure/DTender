import React, { useEffect, useContext } from "react";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DashboardOutlined,
  LogoutOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import { Image, MenuProps, notification } from "antd";
import { Layout, Menu, theme, Button } from "antd";
import { Typography } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import AuthButton from "./AuthButton";
import LottieAnimation from "./Lottie";
import loadingAnimation from "../assets/animation/loading.json";
// import { useSigner } from "wagmi";

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

interface IProp {
  children: React.ReactNode;
}

const CustomLayout = ({ children }: IProp) => {
  const { authState, signIn, signOut, db, isSignedInMetamask } =
    useContext(AuthContext);
  const [currLevel, setCurrLevel] = React.useState(undefined);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  // const { data: signer } = useSigner();
  // const [signerAddress, setSignerAddress] = React.useState<string | null>(null);
  const [optionNames, setOptionNames] = React.useState([
    "Propose a Tender",
    "My Tenders",
    "My Bids",
    "Logout",
  ]);
  const [optionRoutes, setOptionRoutes] = React.useState([
    "/propose-investment",
    "/my-tenders",
    "/my-bids",
    "/logout",
  ]);
  const [iconsList, setIconsList] = React.useState([
    LaptopOutlined,
    MoneyCollectOutlined,
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

  //DYNAMIC NFT FUNCTIONS
  const createNFT = async () => {
    console.log("Called");
    await db!
      .collection("DTenderDynamicNFTMetadata")
      .create([localStorage.getItem("walletAddress") as string, "thirdNFT"]);
    console.log("done");
  };

  const updateNFT = async () => {
    console.log("Called");
    await db!
      .collection("DTenderDynamicNFTMetadata")
      .record("2")
      .call("upgradeLevel", []);
    console.log("done");
  };

  useEffect(() => {
    const getNFTFromID = async () => {
      setLoading(true);
      const { data, block } = await db!
        .collection("DTenderDynamicNFTMetadata")
        // .record(localStorage.getItem("walletAddress") as string)
        .record("1")
        .get();

      // return data?.level;
      console.log("Data: ", data);
      setCurrLevel(data.level);
      setTimeout(() => setLoading(false), 1000);
    };

    getNFTFromID();
  }, []);

  console.log(currLevel);
  return !loading ? (
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
            <Title style={{ color: "white", marginTop: 30 }} level={2}>
              DTender
            </Title>
          </Link>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "20%",
              justifyContent: "space-evenly",
            }}
          >
            <AuthButton authState={authState} signIn={signIn} />
            {isSignedInMetamask && (
              <>
                <div>
                  <Image
                    src="https://ipfs.io/ipfs/QmQUFjHvxCGBiCJPog61PLrcXXK66noEEdDF6dXiyV8hcy?filename=logo.png"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      color: "white",
                      fontWeight: "600",
                      fontSize: "12px",
                      marginTop: "12px",
                    }}
                  >
                    Level: {currLevel! + 1}
                  </p>
                </div>
              </>
            )}
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
  ) : (
    <LottieAnimation height={400} width={400} lottieData={loadingAnimation} />
  );
};

export default CustomLayout;
