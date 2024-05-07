import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import arraySupport from "dayjs/plugin/arraySupport";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(arraySupport);

export default dayjs;
