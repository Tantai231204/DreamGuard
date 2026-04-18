import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  User,
  CreditCard,
  Laptop,
  Share2,
  Lock,
  Cookie,
  UserCheck,
  Clock,
  Globe,
  RefreshCw,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { useBreadcrumb } from "@/components/common/BreadcrumbNav";
import { AppRoute } from "@/lib/constants";

const informationWeCollect = [
  {
    title: "Thông tin cá nhân",
    icon: User,
    points: [
      "Họ và tên của người dùng.",
      "Địa chỉ Email liên hệ.",
      "Số điện thoại.",
      "Địa chỉ giao hàng và nhận hàng.",
    ],
  },
  {
    title: "Thông tin thanh toán",
    icon: CreditCard,
    points: [
      "Phương thức thanh toán đã chọn (Ví điện tử, Thẻ ngân hàng, COD).",
      "Lưu ý: Chúng tôi KHÔNG lưu trữ thông tin thẻ nhạy cảm (số thẻ, mã CVV) trên hệ thống mở.",
    ],
  },
  {
    title: "Thông tin kỹ thuật",
    icon: Laptop,
    points: [
      "Địa chỉ IP thiết bị truy cập.",
      "Thông tin thiết bị (Hệ điều hành, trình duyệt web).",
      "Cookies và dữ liệu phiên bản trang web.",
      "Lịch sử mua hàng và hành vi duyệt web.",
    ],
  },
];

const usagePurposes = [
  "Xử lý và quản lý đơn hàng của bạn.",
  "Đóng gói và giao hàng đến địa chỉ yêu cầu.",
  "Hỗ trợ kỹ thuật và giải đáp khiếu nại (CSKH).",
  "Gửi thông báo về trạng thái đơn hàng, ưu đãi và khuyến mãi (nếu có đăng ký).",
  "Cải thiện, nâng cấp hiệu suất hệ thống và cá nhân hóa trải nghiệm người dùng.",
];

const sharingData = [
  {
    title: "Chia sẻ thông tin an toàn",
    badge: "Bên thứ ba hợp tác",
    icon: Share2,
    points: [
      "Chúng tôi CÓ chia sẻ thông tin giới hạn cho đối tác, nhưng tuyệt đối không bán dữ liệu.",
      "Đơn vị vận chuyển (Tên, SĐT, Địa chỉ) để giao hàng.",
      "Cổng thanh toán (Mã giao dịch) để đối soát đơn hàng.",
      "Đối tác kỹ thuật (Dữ liệu ẩn danh) nhằm tối ưu hệ thống.",
      "Cam kết KHÔNG buôn bán thông tin khách hàng dưới mọi hình thức.",
    ],
  },
];

const securityAndTracking = [
  {
    title: "Bảo mật dữ liệu (Data Security)",
    icon: Lock,
    points: [
      "Trang web liên tục sử dụng giao thức HTTPS an toàn.",
      "Mã hóa dữ liệu trong quá trình truyền tải và lưu trữ.",
      "Giới hạn quyền truy cập chỉ cho nhân viên đã được cấp thẩm quyền.",
    ],
  },
  {
    title: "Cookies & Tracking",
    icon: Cookie,
    points: [
      "Có sử dụng cookies nhằm tăng tốc độ tải trang.",
      "Dùng ghi nhớ trạng thái đăng nhập, tránh phải đăng nhập lại nhiều lần.",
      "Tracking hành vi ẩn danh để đo lường hiệu suất website.",
    ],
  },
];

const dataPolicies = [
  {
    title: "Quyền của người dùng",
    icon: UserCheck,
    description: "Bạn có quyền kiểm soát thông tin cá nhân của mình: xem dữ liệu, yêu cầu chỉnh sửa sai sót, yêu cầu xóa tài khoản vĩnh viễn, hoặc từ chối nhận email marketing bất cứ lúc nào.",
  },
  {
    title: "Thời gian lưu trữ dữ liệu",
    icon: Clock,
    description: "Dữ liệu được lưu trữ trong suốt quá trình bạn duy trì tài khoản. Các thông tin giao dịch sẽ bị xóa hoặc ẩn danh theo quy định lưu trữ dữ liệu tiêu chuẩn (thường sau 2-5 năm).",
  },
  {
    title: "Chuyển dữ liệu quốc tế",
    icon: Globe,
    description: "Hiện tại hệ thống máy chủ vận hành trong nước. Đối với các dịch vụ SaaS, dữ liệu có thể lưu trên cloud quốc tế (AWS, Google Cloud) tuân thủ nghiêm ngặt chuẩn bảo mật.",
  },
  {
    title: "Thay đổi chính sách",
    icon: RefreshCw,
    description: "Chính sách có thể được cập nhật bất kỳ lúc nào để phù hợp quy định mới. Người dùng sẽ nhận được email thông báo và cập nhật (nếu là biến đổi lớn).",
  },
];

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function PrivacyPolicyPage() {
  const { setItems } = useBreadcrumb();

  useEffect(() => {
    setItems([
      { label: "Trang chủ", href: AppRoute.HOME },
      { label: "Chính sách bảo mật", active: true },
    ]);

    return () => setItems([]);
  }, [setItems]);

  return (
    <div className="bg-white text-[#4988c4]-900">
      {/* 1. Phân giới thiệu (Introduction) */}
      <section className="relative overflow-hidden border-b border-[#4988c4]-200 bg-[radial-gradient(circle_at_top_left,_rgba(73,136,196,0.18),_transparent_40%),linear-gradient(135deg,_#eff6ff_0%,_#ffffff_52%,_rgba(191,219,254,0.22)_100%)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4988c4]/50 to-transparent" />
        <div className="container mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <motion.div {...sectionMotion} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4988c4]/15 bg-white/85 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#4988c4] shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Privacy Policy
            </div>
            <h1 className="mt-6 max-w-2xl text-4xl font-black uppercase tracking-tight text-[#4988c4]-950 sm:text-5xl lg:text-6xl">
              Chính sách bảo mật thông tin
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#4988c4]-600 sm:text-base">
              Chào mừng bạn đến với <strong>DreamGuard</strong>. Chúng tôi hiểu rằng quyền riêng tư của bạn là vô cùng quan trọng. 
              Trang này diễn giải cách minh bạch về việc chúng tôi thu thập, nhận, sử dụng và bảo mật dữ liệu của bạn mỗi khi bạn tương tác. 
              Chính sách này áp dụng khi bạn truy cập website, đăng ký tài khoản, hoặc sử dụng bất kì dịch vụ nào từ DreamGuard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={AppRoute.PRODUCTS}
                className="inline-flex items-center gap-2 rounded-full bg-[#4988c4] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#3a73a8]"
              >
                Mua sắm ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div {...sectionMotion} transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] as const }} className="flex flex-col justify-center">
             <div className="rounded-[28px] border border-[#4988c4]/20 bg-white/60 p-6 shadow-xl backdrop-blur-md">
                 <ShieldCheck className="h-16 w-16 text-[#4988c4] mb-4" />
                 <h3 className="text-xl font-bold text-[#4988c4]-950 mb-2">Cam Kết Của Chúng Tôi</h3>
                 <p className="text-[#4988c4]-700 text-sm leading-relaxed">
                   Tại DreamGuard, bảo mật sự riêng tư của khách hàng là ưu tiên hàng đầu. Thông tin của bạn được sử dụng đúng mục đích, giữ bí mật, và hoàn toàn không bị bán cho bên thứ ba.
                 </p>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Thông tin thu thập */}
      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Data Collection</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Thông tin chúng tôi thu thập</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {informationWeCollect.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[30px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-wide text-[#4988c4]-950">{item.title}</h3>
                  <div className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 3. Mục đích sử dụng & 4. Chia sẻ thông tin */}
      <section className="border-y border-[#4988c4]-100 bg-[#4988c4]-50/60">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion}>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Usage & Sharing</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Cách thức sử dụng và chia sẻ dữ liệu</h2>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              
              {/* Mục đích sử dụng */}
              <div className="rounded-[32px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                        <RefreshCw className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950 mt-3">Mục đích sử dụng</h3>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {usagePurposes.map((point) => (
                        <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
              </div>

              {/* Chia sẻ thông tin */}
              {sharingData.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[32px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-wide text-[#4988c4]-950">{item.title}</h3>
                        <span className="mt-3 inline-flex rounded-full border border-[#4988c4]-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-amber-600">
                          {item.badge}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      {item.points.map((point) => (
                        <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Bảo mật dữ liệu & 6. Cookies */}
      <section className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <motion.div {...sectionMotion}>
          <div className="gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#4988c4]">Security & Cookies</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#4988c4]-950">Giải pháp bảo mật và Tracking</h2>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {securityAndTracking.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-[30px] border border-[#4988c4]-200 bg-white p-7 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#4988c4]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-black tracking-wide text-[#4988c4]-950">{item.title}</h3>
                  <div className="mt-5 space-y-3">
                    {item.points.map((point) => (
                      <div key={point} className="flex gap-3 text-sm leading-7 text-[#4988c4]-700">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4988c4]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 7,8,9,10. Quyền Người dùng, Lưu trữ, Thay đổi,...  */}
      <section className="border-y border-[#4988c4]-200 bg-[#4988c4]-950">
        <div className="container mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <motion.div {...sectionMotion} className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-white/10 bg-[#4988c4]/5 p-7 backdrop-blur">
              <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white mb-6">Quy định khác về dữ liệu</h2>
              <div className="space-y-4">
                {dataPolicies.map((item) => {
                    const PolicyIcon = item.icon;
                    return (
                        <div key={item.title} className="block rounded-[24px] border border-[#4988c4]/10 bg-[#4988c4]/5 p-5 transition hover:border-white/20 hover:bg-white/10">
                            <div className="flex items-start gap-4">
                                <PolicyIcon className="h-6 w-6 shrink-0 text-[#7dd3e8]" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.05em] text-[#7dd3e8]">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-white/80">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#4988c4]/5 p-7 backdrop-blur flex flex-col justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#4988c4]/10 text-[#7dd3e8]">
                <Phone className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-black uppercase tracking-tight text-white">Liên Hệ Giải Đáp</h2>
              <p className="mt-4 text-sm leading-7 text-white/80">
                  Nếu bạn có thắc mắc liên quan đến tính bảo mật của website, thông tin cá nhân hay bất kỳ vấn đề nào:
              </p>
              <div className="mt-5 space-y-3">
                  <div className="flex gap-3 text-sm leading-7 text-white/90">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7dd3e8]" />
                    <span><strong>Email hỗ trợ:</strong> privacy@dreamguard.com</span>
                  </div>
                  <div className="flex gap-3 text-sm leading-7 text-white/90">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7dd3e8]" />
                    <span><strong>Hotline:</strong> +84 1900 1234 (Miễn phí cước)</span>
                  </div>
                  <div className="flex gap-3 text-sm leading-7 text-white/90">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#7dd3e8]" />
                    <span><strong>Địa chỉ công ty:</strong> DreamGuard HQ, Tòa nhà ABC, Thành phố Hồ Chí Minh, Việt Nam.</span>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
