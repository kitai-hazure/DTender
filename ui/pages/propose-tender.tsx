import React, { useContext, useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Typography,
  Upload,
} from "antd";
import Moralis from "moralis";
import { AuthContext } from "@/context/AuthContext";
import { PlusOutlined } from "@ant-design/icons";
import { getSolidityDate } from "@/utils/solidity";
import { useRouter } from "next/router";

const { Title } = Typography;

export default function ProposeInvestment() {
  const [form] = Form.useForm();
  const { contract, isSignedInMetamask, isCompany } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const onFinish = async (values: any) => {
    setLoading(true);
    console.log("VALUES: ", values);
    let moralisDocs = values.tenderDocument.fileList.map((doc: any) => {
      console.log("DOC: ", doc);
      return {
        path: doc.name,
        content: doc.thumbUrl,
      };
    });
    const response = await Moralis.EvmApi.ipfs.uploadFolder({
      abi: moralisDocs,
    });
    let ipfsHash = "";
    for (const doc of response.result) ipfsHash += doc.path + "$,$";
    ipfsHash = ipfsHash.slice(0, -3);
    const res = await contract?.createTender(
      values.tenderName,
      values.tenderDescription,
      getSolidityDate(values.tenderEndDate["$d"]),
      ipfsHash,
      values.minimumBidAmount,
      values.maximumBidAmount
    );
    console.log(res);
    notification.success({
      message: "Tender Created",
      description: "Tender has been successfully created.",
    });
    setLoading(false);
  };

  return (
    <div>
      <Title level={2} style={{ textAlign: "center" }}>
        Propose Tender
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
          onFinish={onFinish}
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
            <Upload listType="picture-card" multiple={false} accept="image/*">
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
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
