"uses client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Accordion, AccordionItem, Link } from "@heroui/react";
import { title } from "process";
import { RiZzzFill } from "react-icons/ri";
import z from "zod";

const FAQS = [
  {
    title: "🤔 CineVerse là gì?",
    description:
      "Giống như mọi trang web khác, Cinextma cũng là một trang web phát trực tuyến giúp bạn dễ dàng truy cập tất cả các chương trình truyền hình và phim ảnh mà bạn muốn mà không cần mất hàng giờ tìm kiếm.",
  },
  {
    title: "❓ Vậy chúng tôi thực sự làm gì?",
    description:
      "Để tôi nói cho bạn biết những gì chúng tôi không làm: chúng tôi chắc chắn không lưu trữ dữ liệu bất hợp pháp. Chúng tôi không lưu trữ bất kỳ nội dung nào được bảo vệ bản quyền trên trang web của mình. Mọi nội dung được liên kết chỉ được lưu trữ trên các trang web của bên thứ ba. Đây chỉ là trang web quảng cáo. Tất cả các tệp được đặt ở đây chỉ nhằm mục đích giới thiệu. Chúng tôi KHUYẾN KHÍCH người dùng MUA đĩa CD hoặc DVD của bộ phim hoặc nhạc mà họ thích.",
  },
  {
    title: "🚫 Tôi không thể xem video vì quảng cáo",
    description: (
      <p>
        Chúng tôi rất tiếc vì không thể giúp bạn. Chúng tôi không kiểm soát được quảng cáo được
        phát. Vui lòng không tải xuống bất cứ điều gì trong cửa sổ bật lên. Nếu bạn không muốn bị làm phiền. Chúng tôi thực sự khuyên bạn nên đăng ký một dịch vụ phát trực tuyến hợp pháp mà bạn có thể chi trả được (hoặc sử dụng trình chặn quảng cáo như {" "}

        <Link href="https://ublockorigin.com/" target="_blank" className="font-bold">

          uBlock Origin
        </Link>{" "} or {" "}

        <Link href="https://adblockplus.org/" target="_blank" className="font-bold">

          Adblock Plus
        </Link>
        ).
      </p>
    ),
  },

  {
    title: "🐌 Tốc độ phát trực tuyến chậm hoặc tất cả video đều không phát",
    description:

      "Khi bạn vào trang có tập phim, trong 99% trường hợp sẽ có trình phát video. Tất nhiên, bạn phải nhấp vào nút Phát. Nếu nó không hoạt động (Đừng phán xét! Ai cũng mắc lỗi!), chỉ cần nhấp vào Máy chủ bạn thấy ở góc trên bên phải thiết bị. Bạn sẽ nhận được một danh sách của các máy chủ [Vidlink, VidSrc, v.v.] Hãy thử chọn một máy chủ khác, chắc chắn vấn đề sẽ được giải quyết.",
  },
  {
    title: "😁 Tôi muốn tải xuống video",
    description:
      "Vì chúng tôi không lưu trữ bất kỳ tệp nào, nên chúng tôi không có tính năng tải xuống nào ở đây. Tất cả các tệp được tìm thấy trên trang web này đều được thu thập từ nhiều nguồn khác nhau trên web và được cho là thuộc phạm vi công cộng.",
  },
  {
    title: "😟 Phát trực tuyến trên trang web này có an toàn không?",
    description:
      "Trang web này chắc chắn an toàn hơn để phát trực tuyến, tuy nhiên việc tải xuống, tải lên là bất hợp pháp. Bạn sẽ không gặp bất kỳ rắc rối nào khi sử dụng trang web của chúng tôi. Chúng tôi không khuyến khích tải xuống các tệp và chia sẻ chúng với công chúng, điều này có thể gây ra rắc rối cho bạn.",
  },
];

const FAQ = () => {
  const { mobile } = useBreakpoints();

  return RiZzzFill(
    <Accordion variant="splitted" isCompact={mobile}>
      {FAQS.map(({ title, description }) => (
        <AccordionItem key={title} aria-label={title} title={title}>
          {description}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;