import { AuthContext } from "@/context/AuthContext";
import {
  Button,
  Card,
  Form,
  Image,
  InputNumber,
  Modal,
  notification,
  Typography,
} from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import styles from "../styles/MyTenders.module.css";

interface Tender {
  name: string;
  description: string;
  docsIpfsUrls: string[];
  isAccepted: boolean;
  tenderId: bigint;
  maxBid: bigint;
  minBid: bigint;
  owner: string;
  deadline: Date;
  createdAt: Date;
}

interface Bids {
  bidAmount: bigint;
  bidOwner: string;
  createdAt: Date;
  tenderId: bigint;
  bidId: bigint;
}

interface TenderCardProps {
  tender: Tender;
  setSelectedTender: React.Dispatch<React.SetStateAction<Tender | undefined>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setViewBidsModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const TenderCard = ({
  tender,
  setSelectedTender,
  setShowModal,
  setViewBidsModal,
}: TenderCardProps) => {
  const signerAddress = JSON.parse(
    localStorage.getItem("walletAddress") as string
  );
  const onClick = () => {
    setSelectedTender(tender);
    setShowModal(true);
  };

  const showViewBidsModal = () => {
    setSelectedTender(tender);
    setViewBidsModal(true);
  };

  return (
    <Card className={styles.tenderCard} bodyStyle={{ width: "100%" }}>
      <div className={styles.cardParentDivs}>
        <div className={styles.flexCol}>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Name
            </Typography.Text>
            <Typography.Text className={styles.name}>
              {tender.name}
            </Typography.Text>
          </div>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Description
            </Typography.Text>
            <Typography.Text className={styles.description}>
              {tender.description}
            </Typography.Text>
          </div>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Deadline
            </Typography.Text>
            <Typography.Text className={styles.date}>
              {tender.deadline.toDateString()}
            </Typography.Text>
          </div>
        </div>
        <div className={styles.flexCol}>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Created At
            </Typography.Text>
            <Typography.Text className={styles.date}>
              {tender.createdAt.toDateString()}
            </Typography.Text>
          </div>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Max Bid in Wei
            </Typography.Text>
            <Typography.Text className={styles.bid}>
              {tender.maxBid.toString()}
            </Typography.Text>
          </div>
          <div className={styles.parent}>
            <Typography.Text strong className={styles.label}>
              Min Bid in Wei
            </Typography.Text>
            <Typography.Text className={styles.bid}>
              {tender.minBid.toString()}
            </Typography.Text>
          </div>
        </div>
        <div>
          {tender.docsIpfsUrls.map((url, index) => (
            <div className={styles.imageContainer} key={index}>
              <Image
                src={url}
                width={100}
                height={100}
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
      <Button
        type="primary"
        onClick={
          signerAddress == tender.owner.toLowerCase()
            ? showViewBidsModal
            : onClick
        }
        className={styles.bidButton}
        block
      >
        {signerAddress == tender.owner.toLowerCase()
          ? "View Bids"
          : "Place Bid"}
      </Button>
    </Card>
  );
};

const BidCard = ({ bid }: { bid: Bids }) => {
  return (
    <Card className={styles.bidCard}>
      <div className={styles.bidItem}>
        <Typography.Text strong className={styles.label}>
          Bid Amount
        </Typography.Text>
        <Typography.Text className={styles.bidDisplay}>
          {bid.bidAmount.toString()} Wei
        </Typography.Text>
      </div>
      <div className={styles.bidItem}>
        <Typography.Text strong className={styles.label}>
          Bid Owner
        </Typography.Text>
        <Typography.Text className={styles.bidDisplay}>
          {bid.bidOwner}
        </Typography.Text>
      </div>
      <div className={styles.bidItem}>
        <Typography.Text strong className={styles.label}>
          Created At
        </Typography.Text>
        <Typography.Text className={styles.bidDisplay}>
          {bid.createdAt.toDateString()}
        </Typography.Text>
      </div>
      <Button type="primary" className={styles.bidButton} block>
        Accept Bid
      </Button>
    </Card>
  );
};

export default function MyTenders() {
  const [tenders, setTenders] = useState<Tender[]>();
  const { contract, signer } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState<Tender>();
  const [getBids, setGetBids] = useState<Bids[]>([]);
  const { query } = useRouter();
  const [isMine, setIsMine] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [viewBidsModal, setViewBidsModal] = useState<boolean>(false);
  const [bids, setBids] = useState<Bids[]>([]);

  const onFinish = async (values: any) => {
    try {
      await contract?.createBid(selectedTender?.tenderId, values.bidAmount);
      notification.success({
        message: "Bid Created",
        description: "Your bid has been created successfully",
      });
    } catch (e) {
      notification.error({
        message: "Bid Creation Failed",
        description: "Your bid could not be created",
      });
    } finally {
      setShowModal(false);
    }
  };

  const closeBidsModal = () => {
    setViewBidsModal(false);
    setBids([]);
    setSelectedTender(undefined);
  };

  useEffect(() => {
    setIsMine(query?.mine === "true");
    const getTenders = async () => {
      if (contract) {
        const tenders = await contract?.getTenders();
        let tenderList: Tender[] = [];
        for (const tender of tenders) {
          tenderList.push({
            name: tender.name,
            description: tender.description,
            docsIpfsUrls: tender.docIpfsHash.split("$,$"),
            isAccepted: tender.isAccepted,
            owner: tender.owner,
            createdAt: new Date(tender.createdAt * 1000),
            deadline: new Date(tender.deadline * 1000),
            tenderId: BigInt(tender.tenderId),
            maxBid: BigInt(tender.maxBid),
            minBid: BigInt(tender.minBid),
          });
        }
        if (isMine) {
          const signerAddress = localStorage.getItem("walletAddress");
          tenderList = tenderList.filter(
            (tender) => tender.owner === signerAddress
          );
        }
        setTenders(tenderList);
      }
    };
    getTenders();
  }, [contract]);

  useEffect(() => {
    const getBids = async () => {
      if (contract && selectedTender) {
        const bids = await contract?.getTenderBids(
          BigInt.asUintN(256, selectedTender?.tenderId)
        );
        const bidList: Bids[] = [];
        for (const bid of bids) {
          bidList.push({
            bidAmount: BigInt(bid.bidAmount),
            bidId: BigInt(bid.bidId),
            bidOwner: bid.bidOwner,
            createdAt: new Date(bid.createdAt * 1000),
            tenderId: BigInt(bid.tenderId),
          });
        }
        setBids(bidList);
      } else {
        setBids([]);
      }
    };
    getBids();
  }, [contract, viewBidsModal]);

  return (
    <div>
      <Head>
        <title>Tenders</title>
      </Head>
      <div>
        <Modal
          onOk={form.submit}
          open={showModal}
          onCancel={() => setShowModal(false)}
        >
          <Typography.Title level={2} style={{ textAlign: "center" }}>
            Create Bid for {selectedTender?.name}
          </Typography.Title>
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
        <Modal
          open={viewBidsModal}
          onCancel={closeBidsModal}
          onOk={closeBidsModal}
        >
          <Typography.Title level={2} style={{ textAlign: "center" }}>
            Bids for {selectedTender?.name}
          </Typography.Title>
          <div className={styles.tenderList}>
            {bids.length > 0 ? (
              <>
                {bids.map((bid, index) => (
                  <BidCard key={index} bid={bid} />
                ))}
              </>
            ) : (
              <Typography.Text>No bids yet</Typography.Text>
            )}
          </div>
        </Modal>

        <Typography.Title level={2} className={styles.tenderTitle}>
          {isMine ? "My Tenders" : "All Tenders"}
        </Typography.Title>
        {tenders ? (
          <div className={styles.tenderList}>
            {tenders.map((tender, index) => (
              <TenderCard
                key={index}
                tender={tender}
                setSelectedTender={setSelectedTender}
                setShowModal={setShowModal}
                setViewBidsModal={setViewBidsModal}
              />
            ))}
          </div>
        ) : (
          <Typography.Text>Loading...</Typography.Text>
        )}
      </div>
    </div>
  );
}
