import React, { useContext } from "react";
import { Button, InputNumber, Modal, Select, Typography } from "antd";
import LottieAnimation from "@/components/Lottie";
import TenderLottie from "@/assets/animation/main__tender.json";
import { QRCode } from "react-qr-svg";
import QRJson from "../qrcodes/qrcode.json";
import { AuthContext } from "@/context/AuthContext";

const { Title } = Typography;

export default function Home() {
  const getQRCodeJson = (companyCIN: number) => {
    QRJson["body"]["scope"][0]["query"]["credentialSubject"][
      "corporateIdentificationNumber"
    ]["$eq"] = companyCIN;
    return JSON.stringify(QRJson);
  };
  const { selectedOption } = useContext(AuthContext);
  console.log("SELECTED OPTION: ", selectedOption);

  const [companyCIN, setCompanyCIN] = React.useState<number>(0);
  const [isCompany, setIsCompany] = React.useState<null | boolean>(null);
  const [showQR, setShowQR] = React.useState<boolean>(false);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

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
      <Modal
        title="Login Setup"
        open={!selectedOption && isVisible}
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
        }}
        cancelButtonProps={{ disabled: true }}
        onOk={() => {
          if (isCompany) setShowQR(true);
          else setIsVisible(false);
        }}
      >
        {!showQR && (
          <>
            <Typography>
              Are you logging in as a bidder or an organization?
            </Typography>
            <Select
              defaultValue="bidder"
              style={{ width: 120, marginTop: 8 }}
              onSelect={(value) => setIsCompany(value === "organization")}
            >
              <Select.Option value="bidder">Bidder</Select.Option>
              <Select.Option value="organization">Organization</Select.Option>
            </Select>
          </>
        )}
        {isCompany && !showQR && (
          <>
            <Typography
              style={{
                marginTop: 16,
                marginBottom: 8,
              }}
            >
              Enter your Corporate Identification Number
            </Typography>
            <InputNumber onChange={(value) => setCompanyCIN(value as number)} />
          </>
        )}
        {showQR && (
          <QRCode
            level="Q"
            style={{ width: 256 }}
            value={getQRCodeJson(companyCIN)}
          />
        )}
      </Modal>
      {/* <QRCode level="Q" style={{ width: 256 }} value={getQRCodeJson(1234)} /> */}
    </div>
  );
}
