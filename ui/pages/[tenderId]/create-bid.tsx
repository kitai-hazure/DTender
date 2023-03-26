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
import QRJson from "../../qrcodes/qrcode.json";
import { AuthContext } from "@/context/AuthContext";
import { useSigner } from "wagmi";
import { Signer } from "@wagmi/core";
import { Contract, ethers } from "ethers";
import DTenderContract from "@/contracts/DTender.json";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function CreateBid() {
  const { data: signer } = useSigner();
  const [contract, setContract] = React.useState<Contract>();
  const [form] = Form.useForm();
  const [selectedTender, setSelectedTender] = React.useState<any>();

  const onFinish = (values: any) => {
    console.log("VALUES: ", values);
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
      <Modal onOk={form.submit} open>
        <Title level={2} style={{ textAlign: "center" }}>
          Create Bid for {selectedTender?.name}
        </Title>

        <Form
          layout="vertical"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          form={form}
          onFinish={onFinish}
        >
          <Form.Item
            label="Bid Amount"
            name="bidAmount"
            rules={[
              { required: true, message: "Please input bid amount!" },
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
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
