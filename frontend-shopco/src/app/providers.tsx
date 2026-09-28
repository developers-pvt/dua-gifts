"use client";

import React, { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store";

type Props = {
  children: React.ReactNode;
};

export default function Providers({ children }: Props) {
  const storeRef = useRef<ReturnType<typeof makeStore>>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current.store}>{children}</Provider>;
}
