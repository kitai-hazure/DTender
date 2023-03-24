import React from "react";
import { Typography } from "antd";
import LottieAnimation from "@/components/Lottie";
import TenderLottie from "@/assets/animation/main__tender.json";

const { Title } = Typography;

export default function Home() {
  return (
    <div>
      <Title level={1} style={{ textAlign: "center" }}>
        Welcome to DTender
      </Title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Title
          level={5}
          style={{ textAlign: "center", fontWeight: "400", width: "80%" }}
        >
          DTender is a decentralized tendering platform that allows you to
          participate in tenders and auctions without any intermediaries.
        </Title>
      </div>
      <LottieAnimation lottieData={TenderLottie} height={"75%"} width={"40%"} />
    </div>
  );
}
