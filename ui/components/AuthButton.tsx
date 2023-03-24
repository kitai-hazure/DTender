import React from "react";
import { Button, Typography } from "antd";
import { AuthState } from "@polybase/auth";

const { Title } = Typography;
interface IAuthButtonProps {
  authState: AuthState;
  signIn: () => void;
}

const AuthButton = ({ authState, signIn }: IAuthButtonProps) => {
  return authState ? (
    <div>
      <Title level={3} style={{ color: "white" }}>
        Welcome{", "}
        {`${authState?.userId?.slice(0, 4)}....${authState?.userId?.slice(-4)}`}
      </Title>
    </div>
  ) : (
    <div>
      <Button
        type="primary"
        htmlType="submit"
        style={{
          width: "16vw",
          padding: "19px 0",
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 600,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={signIn}
      >
        Sign In
      </Button>
    </div>
  );
};

export default AuthButton;
