import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatRelativeTime(date: Date | string): string {
  return dayjs(date).fromNow();
}

export function formatDate(date: Date | string): string {
  return dayjs(date).format("MMMM D, YYYY");
}
