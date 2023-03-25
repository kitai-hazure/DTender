import React, { useContext, useEffect } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
  Upload,
} from "antd";
import LottieAnimation from "@/components/Lottie";
import TenderLottie from "@/assets/animation/main__tender.json";
import { QRCode } from "react-qr-svg";
import QRJson from "../qrcodes/qrcode.json";
import { AuthContext } from "@/context/AuthContext";
import { useSigner } from "wagmi";
import { Signer } from "@wagmi/core";
import { Contract, ethers } from "ethers";
import DTenderContract from "@/contracts/DTender.json";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function ProposeInvestment() {
  const { data: signer } = useSigner();
  const [contract, setContract] = React.useState<Contract>();
  const [docs, setDocs] = React.useState<any>();
  const [form] = Form.useForm();

  const onChange = (info: any) => {
    console.log("DONE: ", info.file.response);
    setDocs(info.file.response);
  };

  useEffect(() => {
    console.log("SIGNER: ", signer);
    if (signer) {
      const contract = new ethers.Contract(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        DTenderContract.abi,
        signer
      );
      setContract(contract);
      const idk = async () => {
        contract.getTenders().then((res: any) => {
          console.log("RES: ", res);
        });
      };
      idk();
    }
  }, [signer]);

  return (
    <div>
      <Title level={2} style={{ textAlign: "center" }}>
        Propose Investment
      </Title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Title
          level={5}
          style={{ textAlign: "center", fontWeight: "400", width: "80%" }}
        >
          Propose an tender to the DTender platform.
        </Title>
        <Form
          layout="vertical"
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
          }}
          form={form}
          onFinish={(values) => {
            console.log("VALUES: ", values);
          }}
        >
          <Form.Item
            label="Tender Name"
            name="tenderName"
            rules={[{ required: true, message: "Please input tender name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tender Description"
            name="tenderDescription"
            rules={[
              { required: true, message: "Please input tender description!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Minimum Bid Amount"
            name="minimumBidAmount"
            rules={[
              { required: true, message: "Please input minimum bid amount!" },
              { type: "number", message: "Please input a valid number!" },
              {
                validator: (_, value) => {
                  if (value < 0)
                    return Promise.reject("Please input a positive number!");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Maximum Bid Amount"
            name="maximumBidAmount"
            rules={[
              { required: true, message: "Please input maximum bid amount!" },
              { type: "number", message: "Please input a valid number!" },
              {
                validator: (_, value) => {
                  if (value < 0)
                    return Promise.reject("Please input a positive number!");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            label="Tender End Date"
            name="tenderEndDate"
            rules={[
              { required: true, message: "Please input tender end date!" },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="Tender Document"
            name="tenderDocument"
            rules={[
              { required: true, message: "Please input tender document!" },
            ]}
          >
            <Upload
              listType="picture-card"
              multiple={false}
              onChange={onChange}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "16vw",
              padding: "19px 0",
              borderRadius: 12,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            Propose
          </Button>
        </Form>
      </div>
    </div>
  );
}
