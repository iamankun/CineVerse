"use client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Accordion, AccordionItem, Link } from "@heroui/react";

const FAQS = [
  {
    key: "CineVerseLaGi",
    title: "🤔 CineVerse là gì?",
    description: (
      <p className="text-foreground-600">
        Giống như mọi trang web khác, CineVerse cũng là một trang web phát trực tuyến giúp bạn dễ dàng 
        truy cập tất cả các chương trình truyền hình và phim ảnh mà bạn muốn mà không cần mất hàng giờ tìm kiếm.
      </p>
    )
  },
  {
    key: "CineVerseDangLamGi",
    title: "❓ Vậy CineVerse thực sự đang làm gì?",
    description: (
      <div className="space-y-2 text-foreground-600">
        <p>
          Xin chào, mình là{" "}
          <Link href="https://ankunstudio.info" isExternal className="italic">
            An Kun - Nhạc sĩ, nghệ sĩ và là tên phiêu bạc
          </Link>
        </p>
        <p>
          Để mình nói cho bạn nghe những gì CineVerse không làm: chúng tôi chắc chắn không lưu trữ dữ liệu bất hợp pháp.
          Đây là trang điện ảnh và TV Show với các bộ phim được xuất bản sạch, tức là:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Không spam quảng cáo</li>
          <li>Không cá độ</li>
          <li>Không chèn những nội dung đã cấm trong luật quảng cáo của Việt Nam</li>
        </ul>
        <p className="italic">(Rất ghét quảng cáo và phomo 😡)</p>
        <p>
          Chúng tôi không lưu trữ bất kỳ nội dung nào được bảo vệ bản quyền.
          Mọi nội dung đều thông qua các kênh phân phối có sẵn và công khai.
        </p>
        <p>
          CineVerse đặt ở đây sẽ cố gắng tuân thủ về quyền bảo vệ trí tuệ các tác phẩm.
          Chúng tôi RẤT chi là KHUYẾN KHÍCH người dùng MUA đĩa CD hoặc DVD cũng như ỦNG HỘ
          tác phẩm và các ấn phẩm phái sinh như ÂM NHẠC | TRUYỆN TRANH | STANDEE | và vân vân... mà bạn thích.
        </p>
      </div>
    )
  },
  {
    key: "KhongQuangCao",
    title: "🚫 Mình có thể xem video không quảng cáo được không?",
    description: (
      <div className="space-y-2 text-foreground-600">
        <p>
          Tớ rất tiếc vì không thể giúp bạn. Chúng tôi hoàn toàn kiểm soát quảng cáo được phát.
          Nhưng vui lòng hiểu cho tớ ghét quảng cáo 😡 nên rất tiếc không giúp bạn được vì,
          nó đã bị ban ngay từ vòng gửi xe.
        </p>
        <p>
          Tuy nhiên không tắt quảng cáo bằng các nền tảng block ADs. Nếu bạn không muốn bị gián đoạn vì tốc độ và ti tỉ các vấn đề
          đôi lúc do chặn quảng cáo gây ra. (Thấy nó phiền chưa 😡 cọc N)
          Vậy nên bạn cứ yên tâm vì CineVerse không chèn quảng cáo vào.
        </p>
        <p>
          <Link href="https://ublockorigin.com/" isExternal className="font-bold">
            uBlock Origin
          </Link>
          {" "}hoặc{" "}
          <Link href="https://adblockplus.org/" isExternal className="font-bold">
            Adblock Plus
          </Link>
        </p>
      </div>
    )
  },
  {
    key: "TocDoStream",
    title: "🐌 Tốc độ phát trực tuyến chậm hoặc tất cả video đều không phát",
    description: (
      <p className="text-foreground-600">
        Khi bạn vào trang có tập phim, trong 99% trường hợp sẽ có trình phát video. Tất nhiên, bạn phải nhấp vào nút Phát. 
        Nếu nó không hoạt động (Đừng phán xét! Ai cũng mắc lỗi!), chỉ cần nhấp vào Máy chủ bạn thấy ở góc trên bên phải thiết bị. 
        Bạn sẽ nhận được một danh sách của các máy chủ [Vidlink, VidSrc, v.v.] Hãy thử chọn một máy chủ khác, chắc chắn vấn đề sẽ được giải quyết.
      </p>
    )
  },
  {
    key: "TaiXuong",
    title: "😁 Tôi muốn tải xuống video",
    description: (
      <p className="text-foreground-600">
        Vì chúng tôi không lưu trữ bất kỳ tệp nào, nên chúng tôi không có tính năng tải xuống nào ở đây. 
        Tất cả các tệp được tìm thấy trên trang web này đều được thu thập từ nhiều nguồn khác nhau trên web và được cho là thuộc phạm vi công cộng.
      </p>
    )
  },
  {
    key: "AnToan",
    title: "😟 Phát trực tuyến trên trang web này có an toàn không?",
    description: (
      <p className="text-foreground-600">
        Trang web này chắc chắn an toàn hơn để phát trực tuyến, tuy nhiên việc tải xuống, tải lên là bất hợp pháp. 
        Bạn sẽ không gặp bất kỳ rắc rối nào khi sử dụng trang web của chúng tôi. 
        Chúng tôi không khuyến khích tải xuống các tệp và chia sẻ chúng với công chúng, điều này có thể gây ra rắc rối cho bạn.
      </p>
    )
  }
];

const FAQ = () => {
  const { mobile } = useBreakpoints();

  return (
    <Accordion variant="splitted" isCompact={mobile}>
      {FAQS.map(({ key, title, description }) => (
        <AccordionItem key={key} aria-label={title} title={title}>
          {description}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;