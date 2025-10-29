"use client";

import React, { useEffect, useRef } from "react";
import { FloatingNavBar } from "@/components/ui/layout/FloatingNavBar";

// Component chính
const NotFound: React.FC = () => {
    // 1. Typescript for Refs - Thêm generic type cho useRef
    const visorCanvasRef = useRef<HTMLCanvasElement>(null);
    const cordCanvasRef = useRef<HTMLCanvasElement>(null);
    
    // Sử dụng useEffect để đặt document title
    useEffect(() => {
        document.title = `404 Không có nội dung | CineVerse`;
    }, []);

    // Logic xử lý Canvas và Animation
    useEffect(() => {
        // Thêm marker vào body (giữ nguyên logic gốc)
        document.body.setAttribute("data-not-found", "true");

        // --- Visor Drawing Logic ---
        const drawVisor = () => {
            const canvas = visorCanvasRef.current;
            if (!canvas) return;
            // 2. Typescript for getContext
            const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
            if (!ctx) return;

            ctx.beginPath();
            ctx.moveTo(5, 45);
            ctx.bezierCurveTo(15, 64, 45, 64, 55, 45);
            ctx.lineTo(55, 20);
            ctx.bezierCurveTo(55, 15, 50, 10, 45, 10);
            ctx.lineTo(15, 10);
            ctx.bezierCurveTo(15, 10, 5, 10, 5, 20);
            ctx.lineTo(5, 45);
            ctx.fillStyle = "#2f3640";
            ctx.strokeStyle = "#f5f6fa";
            ctx.fill();
            ctx.stroke();
        };

        // --- Cord Animation Logic ---
        const cordCanvas = cordCanvasRef.current;
        if (!cordCanvas) return;
        
        const ctx: CanvasRenderingContext2D | null = cordCanvas.getContext("2d");
        if (!ctx) return;

        let y1: number = 160;
        let y2: number = 100;
        let y3: number = 100;
        let y1Forward: boolean = true;
        let y2Forward: boolean = false;
        let y3Forward: boolean = true;
        
        let animationId: number;

        const animate = () => {
            // 3. Sử dụng requestAnimationFrame
            animationId = requestAnimationFrame(animate); 
            ctx.clearRect(0, 0, cordCanvas.width, cordCanvas.height);

            ctx.beginPath();
            ctx.moveTo(130, 170);
            ctx.bezierCurveTo(250, y1, 345, y2, 400, y3);
            ctx.strokeStyle = "white";
            ctx.lineWidth = 8;
            ctx.stroke();

            // Cập nhật vị trí dây
            if (y1 <= 100) y1Forward = true;
            if (y1 >= 300) y1Forward = false;
            if (y2 <= 100) y2Forward = true;
            if (y2 >= 310) y2Forward = false;
            if (y3 <= 100) y3Forward = true;
            if (y3 >= 317) y3Forward = false;

            y1Forward ? (y1 += 1) : (y1 -= 1);
            y2Forward ? (y2 += 1) : (y2 -= 1);
            y3Forward ? (y3 += 1) : (y3 -= 1);
        };

        drawVisor();
        animate();

        return () => {
            // Cleanup function
            document.body.removeAttribute("data-not-found");
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, []);

    // Custom Styles (giữ nguyên thiết kế Astronaut)
    const customStyles = `
        /* Import Font: Dosis (cho phong cách hiện đại/tối giản) */
        @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@200;300;400;500;600;700;800&display=swap');
        
        body { margin: 0; padding: 0; }

        .not-found-container {
            font-family: "Dosis", sans-serif;
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            background: linear-gradient(90deg, rgba(47, 54, 64, 1) 23%, rgba(24, 27, 32, 1) 100%);
            overflow: hidden;
            z-index: 9999;
        }

        .moon {
            background: linear-gradient(90deg, rgba(208, 208, 208, 1) 48%, rgba(145, 145, 145, 1) 100%);
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60vw;
            height: 60vw;
            /* Đã giảm kích thước tối đa để cân bằng thị giác tốt hơn */
            max-width: 650px; 
            max-height: 650px;
            border-radius: 100%;
            box-shadow: 0px 0px 30px -4px rgba(0, 0, 0, 0.5);
            z-index: 0;
        }

        .moon__crater {
            position: absolute;
            border-radius: 100%;
            background: linear-gradient(90deg, rgba(122, 122, 122, 1) 38%, rgba(195, 195, 195, 1) 100%);
            opacity: 0.6;
        }

        .moon__crater1 {
            top: 25%; left: 50%; width: 7%; height: 20%; max-width: 60px; max-height: 180px;
        }

        .moon__crater2 {
            top: 65%; left: 34%; width: 4%; height: 8%; max-width: 40px; max-height: 80px; transform: rotate(55deg);
        }

        .moon__crater3 {
            top: -2%; left: 4%; width: 7%; height: 13%; max-width: 65px; max-height: 120px; transform: rotate(250deg);
        }

        .star {
            background: #9ca3af;
            position: absolute;
            width: 5px;
            height: 5px;
            border-radius: 100%;
            animation: shimmer 1.5s infinite alternate;
        }

        @keyframes shimmer {
            from { opacity: 0.3; }
            to { opacity: 0.8; }
        }

        .star1 { top: 40%; left: 50%; animation-delay: 1s; }
        .star2 { top: 60%; left: 90%; animation-delay: 3s; }
        .star3 { top: 10%; left: 70%; animation-delay: 2s; }
        .star4 { top: 90%; left: 40%; }
        .star5 { top: 20%; left: 30%; animation-delay: 0.5s; }

        .error {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 2;
            width: 50vw;
            max-width: 500px;
            padding: 20px;
        }

        .error__title {
            font-size: 3.5rem;
            font-weight: 700;
            line-height: 1.2;
            color: #2f3640;
            margin: 0 0 1rem 0;
        }

        .error__subtitle {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 1rem 0;
            color: #2f3640;
        }

        .error__description {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #2f3640;
            opacity: 0.85;
            margin: 0;
        }

        .astronaut {
            position: absolute;
            width: 185px;
            height: 300px;
            right: 5%;
            top: 55%;
            transform: translate(-50%, -50%) rotate(20deg) scale(1.2);
            animation: floatAstronaut 3s ease-in-out infinite alternate;
            z-index: 100;
        }

        @keyframes floatAstronaut {
            from { transform: translate(-50%, -50%) rotate(20deg) scale(1.2); }
            to { transform: translate(-50%, -55%) rotate(22deg) scale(1.2); }
        }

        .astronaut__head { background-color: white; position: absolute; top: 60px; left: 60px; width: 60px; height: 60px; border-radius: 2em; }
        .astronaut__head-visor-flare1 { background-color: #7f8fa6; position: absolute; top: 2em; left: 40px; width: 10px; height: 10px; border-radius: 2em; opacity: 0.5; }
        .astronaut__head-visor-flare2 { background-color: #718093; position: absolute; top: 40px; left: 38px; width: 5px; height: 5px; border-radius: 2em; opacity: 0.3; }
        .astronaut__backpack { background-color: #bfbfbf; position: absolute; top: 90px; left: 47px; width: 86px; height: 90px; border-radius: 8px; }
        .astronaut__body { background-color: #e6e6e6; position: absolute; top: 115px; left: 55px; width: 70px; height: 80px; border-radius: 8px; }
        .astronaut__body__chest { background-color: #d9d9d9; position: absolute; top: 140px; left: 68px; width: 45px; height: 25px; border-radius: 6px; }
        .astronaut__arm-left1 { background-color: #e6e6e6; position: absolute; top: 127px; left: 9px; width: 65px; height: 20px; border-radius: 8px; transform: rotate(-30deg); }
        .astronaut__arm-left2 { background-color: #e6e6e6; position: absolute; top: 102px; left: 7px; width: 20px; height: 45px; border-radius: 8px; transform: rotate(-12deg); border-top-left-radius: 8em; border-top-right-radius: 8em; }
        .astronaut__arm-right1 { background-color: #e6e6e6; position: absolute; top: 113px; left: 100px; width: 65px; height: 20px; border-radius: 8px; transform: rotate(-10deg); }
        .astronaut__arm-right2 { background-color: #e6e6e6; position: absolute; top: 78px; left: 141px; width: 20px; height: 45px; border-radius: 8px; transform: rotate(-10deg); border-top-left-radius: 8em; border-top-right-radius: 8em; }
        .astronaut__arm-thumb-left { background-color: #e6e6e6; position: absolute; top: 110px; left: 21px; width: 10px; height: 6px; border-radius: 8em; transform: rotate(-35deg); }
        .astronaut__arm-thumb-right { background-color: #e6e6e6; position: absolute; top: 90px; left: 133px; width: 10px; height: 6px; border-radius: 8em; transform: rotate(20deg); }
        .astronaut__wrist-left { background-color: #e67e22; position: absolute; top: 122px; left: 6.5px; width: 21px; height: 4px; border-radius: 8em; transform: rotate(-15deg); }
        .astronaut__wrist-right { background-color: #e67e22; position: absolute; top: 98px; left: 141px; width: 21px; height: 4px; border-radius: 8em; transform: rotate(-10deg); }
        .astronaut__leg-left { background-color: #e6e6e6; position: absolute; top: 188px; left: 50px; width: 23px; height: 75px; border-radius: 8px; transform: rotate(10deg); }
        .astronaut__leg-right { background-color: #e6e6e6; position: absolute; top: 188px; left: 108px; width: 23px; height: 75px; border-radius: 8px; transform: rotate(-10deg); }
        .astronaut__foot-left { background-color: white; position: absolute; top: 240px; left: 43px; width: 2em; height: 20px; transform: rotate(10deg); border-radius: 3px; border-top-left-radius: 8em; border-top-right-radius: 8em; border-bottom: 4px solid #e67e22; }
        .astronaut__foot-right { background-color: white; position: absolute; top: 240px; left: 111px; width: 2em; height: 20px; transform: rotate(-10deg); border-radius: 3px; border-top-left-radius: 8em; border-top-right-radius: 8em; border-bottom: 4px solid #e67e22; }

        @media (max-width: 768px) {
            .moon { width: 80vw; height: 80vw; top: 40%; }
            .error { width: 70vw; max-width: 400px; top: 28%; }
            .error__title { font-size: 2.5rem; }
            .error__subtitle { font-size: 1.3rem; }
            .error__description { font-size: 1rem; }
            .astronaut { width: 120px; height: 200px; right: 5%; top: 70%; transform: translate(-50%, -50%) rotate(15deg) scale(1); }
        }

        @media (max-width: 480px) {
            .moon { width: 95vw; height: 95vw; top: 38%; }
            .error { width: 90vw; top: 22%; }
            .error__title { font-size: 2rem; }
            .error__subtitle { font-size: 1.2rem; }
            .error__description { font-size: 0.95rem; }
            .astronaut { width: 100px; height: 170px; right: 2%; top: 80%; transform: translate(-50%, -50%) rotate(10deg) scale(0.8); }
        }
    `;

    return (
        <>
            {/* 4. Sử dụng <style> tag trong JSX để nhúng CSS */}
            <style dangerouslySetInnerHTML={{ __html: customStyles }} />

            <div className="not-found-container">
                {/* Các yếu tố nền (Mặt trăng và Sao) */}
                <div className="moon"></div>
                <div className="moon__crater moon__crater1"></div>
                <div className="moon__crater moon__crater2"></div>
                <div className="moon__crater moon__crater3"></div>

                <div className="star star1"></div>
                <div className="star star2"></div>
                <div className="star star3"></div>
                <div className="star star4"></div>
                <div className="star star5"></div>

                {/* Nội dung Lỗi */}
                <div className="error">
                    <h1 className="error__title">Lỗi 404</h1>
                    <h2 className="error__subtitle">CineVerse - Vũ trụ Điện Ảnh</h2>
                    <p className="error__description">
                        Haizzz, không có nội dung.
                        <br />
                        Có vẻ trang bạn tìm không tồn tại, quay về trang chủ hoặc tìm kiếm nội dung cho bạn nào.
                    </p>
                </div>

                <div className="astronaut">
                    <div className="astronaut__backpack"></div>
                    <div className="astronaut__body"></div>
                    <div className="astronaut__body__chest"></div>
                    <div className="astronaut__arm-left1"></div>
                    <div className="astronaut__arm-left2"></div>
                    <div className="astronaut__arm-right1"></div>
                    <div className="astronaut__arm-right2"></div>
                    <div className="astronaut__arm-thumb-left"></div>
                    <div className="astronaut__arm-thumb-right"></div>
                    <div className="astronaut__leg-left"></div>
                    <div className="astronaut__leg-right"></div>
                    <div className="astronaut__foot-left"></div>
                    <div className="astronaut__foot-right"></div>
                    <div className="astronaut__wrist-left"></div>
                    <div className="astronaut__wrist-right"></div>
                    <div className="astronaut__cord">
                        {/* 6. Canvas for Cord */}
                        <canvas ref={cordCanvasRef} id="cord" height="500px" width="500px"></canvas>
                    </div>
                    <div className="astronaut__head">
                        {/* 7. Canvas for Visor */}
                        <canvas ref={visorCanvasRef} id="visor" width="60px" height="60px"></canvas>
                        <div className="astronaut__head-visor-flare1"></div>
                        <div className="astronaut__head-visor-flare2"></div>
                    </div>
                </div>

                {/* FloatingNavBar */}
                <FloatingNavBar />
            </div>
        </>
    );
}

export default NotFound;
