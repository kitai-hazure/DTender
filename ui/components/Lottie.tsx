import React from "react";
import Lottie from "react-lottie";

interface IProps {
  lottieData: any;
  height: any;
  width: any;
}
const LottieAnimation = ({ lottieData, height, width }: IProps) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottieData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return <Lottie options={defaultOptions} height={height} width={width} />;
};

export default LottieAnimation;
