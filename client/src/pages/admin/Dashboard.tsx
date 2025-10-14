import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileDown } from "lucide-react";

// (Tuỳ chọn) thay bằng ảnh của bạn hoặc giữ null để dùng 👤
// import DevonLane from "../../images/DevonLane.png";
// import DianneRussell from "../../images/DianneRussell.png";
// import JaneCooper from "../../images/JaneCooper.png";
// import JennyWilson from "../../images/JennyWilson.png";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("12 Months");

  const baseData = [
    { month: "Feb", value1: 55000, value2: 30000 },
    { month: "Mar", value1: 38000, value2: 33000 },
    { month: "Apr", value1: 42000, value2: 36000 },
    { month: "May", value1: 60000, value2: 35000 },
    { month: "Jun", value1: 45691, value2: 39000 },
    { month: "Jul", value1: 12000, value2: 37000 },
    { month: "Aug", value1: 46000, value2: 40000 },
    { month: "Sep", value1: 48000, value2: 42000 },
    { month: "Oct", value1: 80000, value2: 45000 },
    { month: "Nov", value1: 50000, value2: 44000 },
    { month: "Dec", value1: 54000, value2: 47000 },
    { month: "Jan", value1: 96000, value2: 49000 },
  ];

  // Thu nhỏ dataset dựa theo period để biểu đồ thoáng hơn
  const data = useMemo(() => {
    switch (selectedPeriod) {
      case "6 Months":
        return baseData.slice(-6);
      case "30 Days":
      case "7 Days":
        // demo: vẫn dùng dữ liệu tháng, thực tế bạn đổi sang daily data là đẹp nhất
        return baseData.slice(-4);
      default:
        return baseData;
    }
  }, [selectedPeriod]);

  const customers = [
    {
      name: "Jenny Wilson",
      email: "jenny-wilson@gmail.com",
      amount: "$11,234",
      location: "Austin",
      avatar: "DevonLane",
    },
    {
      name: "Devon Lane",
      email: "devon-lane@gmail.com",
      amount: "$11,159",
      location: "New York",
      avatar: "DevonLane",
    },
    {
      name: "Jane Cooper",
      email: "jane-cooper@gmail.com",
      amount: "$10,483",
      location: "Toledo",
      avatar: "DevonLane",
    },
    {
      name: "Dianne Russell",
      email: "dianne-russell@gmail.com",
      amount: "$9,084",
      location: "Naperville",
      avatar: "DevonLane",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-2.5 py-2 shadow-md rounded border border-gray-200">
          <p className="text-[11px] font-medium text-gray-600">June 2025</p>
          <p className="text-xs font-semibold text-gray-900">
            ${Number(payload[0].value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Stats gọn */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="text-[11px] text-gray-500 uppercase mb-1.5">User</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 leading-none">1,500</div>
            <div className="text-[12px] text-green-600 font-medium">+36% ↑</div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="text-[11px] text-gray-500 uppercase mb-1.5">Category</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 leading-none">500</div>
            <div className="text-[12px] text-red-600 font-medium">+14% ↓</div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="text-[11px] text-gray-500 uppercase mb-1.5">Spending</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 leading-none">84,382</div>
            <div className="text-[12px] text-green-600 font-medium">+36% ↑</div>
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="text-[11px] text-gray-500 uppercase mb-1.5">Total Money</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-gray-900 leading-none">33,493,022 $</div>
            <div className="text-[12px] text-green-600 font-medium">+36% ↑</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Chart gọn */}
        <section className="xl:col-span-2 bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Report money</h2>
            <div className="flex items-center gap-1.5">
              {["12 Months", "6 Months", "30 Days", "7 Days"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1.5 text-xs rounded ${
                    selectedPeriod === period
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {period}
                </button>
              ))}
              <button className="ml-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-black hover:text-[#4338CA]">
                <FileDown size={14} />
                Export PDF
              </button>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value1"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#6366F1" }}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#A5B4FC"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent customers gọn */}
        <aside className="bg-white rounded-md shadow-sm p-4 border border-gray-100">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Customers</h2>
            <p className="text-xs text-gray-500">Top customers in recent period</p>
          </div>

          <div className="space-y-3">
            {customers.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm leading-tight">{c.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">{c.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 text-sm leading-tight">{c.amount}</div>
                  <div className="text-[11px] text-gray-500">{c.location}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 text-xs text-gray-600 hover:text-[#4338CA] font-medium flex items-center justify-center gap-1.5">
            SEE ALL CUSTOMERS <span>→</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
