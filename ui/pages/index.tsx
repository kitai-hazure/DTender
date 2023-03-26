import React, { useContext } from "react";
import {
  Button,
  InputNumber,
  Modal,
  notification,
  Select,
  Typography,
} from "antd";
import LottieAnimation from "@/components/Lottie";
import TenderLottie from "@/assets/animation/main__tender.json";
import { QRCode } from "react-qr-svg";
import QRJson from "../qrcodes/qrcode.json";
import { AuthContext } from "@/context/AuthContext";
import { useContractEvent } from "wagmi";
import DTenderJSON from "@/contracts/DTender.json";

const { Title } = Typography;

export default function Home() {
  const { db } = useContext(AuthContext);
  const getQRCodeJson = (companyCIN: number) => {
    QRJson["body"]["scope"][0]["query"]["credentialSubject"][
      "corporateIdentificationNumber"
    ]["$eq"] = companyCIN;
    return JSON.stringify(QRJson);
  };
  const { selectedOption, isSignedInMetamask } = useContext(AuthContext);
  console.log("SELECTED OPTION: ", selectedOption);

  const [companyCIN, setCompanyCIN] = React.useState<number>(0);
  const [isCompany, setIsCompany] = React.useState<null | boolean>(null);
  const [showQR, setShowQR] = React.useState<boolean>(false);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const { setCompany, setOptionToTrue } = useContext(AuthContext);

  const completeCompanyVerification = () => {
    onVerificationOk();
    notification.success({
      message: "Verification Successful",
      description:
        "You have been successfully verified using the polygon ID zkp proof. Hell yeah!!!!",
    });
    setCompany(true);
    setOptionToTrue();
    setShowQR(false);
    setIsVisible(false);
  };

  const completeBidderVerification = () => {
    notification.success({
      message: "Successful Login",
      description: "You are ready to start bidding on tenders. Hell yeah!!!!",
    });
    setCompany(false);
    setOptionToTrue();
    setIsVisible(false);
  };

  const onVerificationOk = async () => {
    // polybase addition
    await db!
      .collection("VerifiedCompany")
      .create([
        localStorage.getItem("walletAddress") as string,
        localStorage.getItem("walletAddress") as string,
      ]);
  };

  useContractEvent({
    address: `0x5c876A33570B1202Caf2892ce3D6F53c6c40bEC0`,
    abi: DTenderJSON.abi,
    eventName: "ProofSubmitted",
    listener: (event) => {
      completeCompanyVerification();
    },
  });

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
        open={!selectedOption && isVisible && isSignedInMetamask}
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
        }}
        cancelButtonProps={{ disabled: true }}
        onOk={async () => {
          if (isCompany) {
            const records = await db!
              .collection("VerifiedCompany")
              .where(
                "walletAddress",
                "==",
                localStorage.getItem("walletAddress") as string
              )
              .get();
            if (records) {
              setShowQR(false);
            } else {
              setShowQR(true);
            }
          } else {
            completeBidderVerification();
          }
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
    </div>
  );
}
