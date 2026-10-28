import React from "react";
import { useParams } from "react-router-dom";
import ScheduleBoard from "./components/ScheduleBoard";

export default function ManageSchedule() {
  const { storeId } = useParams();
  return <ScheduleBoard mode="admin" storeId={storeId} />;
}
