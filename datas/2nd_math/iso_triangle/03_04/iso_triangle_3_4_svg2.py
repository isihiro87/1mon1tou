import numpy as np
import os
import math

# 出力ディレクトリ
OUTPUT_DIR = "output_prob04_requests"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

class SVGGeometryPlotter:
    def __init__(self, filename, width=600, height=600):
        self.filename = filename
        self.width = width
        self.height = height
        self.elements = []
        self.all_points = []
        self.min_x, self.max_x = float('inf'), float('-inf')
        self.min_y, self.max_y = float('inf'), float('-inf')
        self.padding = 0.05
        self.scale = 1.0

    def _track_points(self, points):
        if not isinstance(points, list):
            points = [points]
        for p in points:
            self.all_points.append(p)
            self.min_x = min(self.min_x, p[0])
            self.max_x = max(self.max_x, p[0])
            self.min_y = min(self.min_y, p[1])
            self.max_y = max(self.max_y, p[1])

    def _calculate_transform(self):
        if not self.all_points: return
        data_width = self.max_x - self.min_x
        data_height = self.max_y - self.min_y
        
        if data_width == 0: data_width = 1
        if data_height == 0: data_height = 1

        scale_x = (self.width * (1 - self.padding * 2)) / data_width
        scale_y = (self.height * (1 - self.padding * 2)) / data_height
        self.scale = min(scale_x, scale_y)
        
        self.center_x = (self.min_x + self.max_x) / 2
        self.center_y = (self.min_y + self.max_y) / 2
        self.svg_cx = self.width / 2
        self.svg_cy = self.height / 2

    def _transform(self, x, y):
        svg_x = self.svg_cx + (x - self.center_x) * self.scale
        svg_y = self.svg_cy - (y - self.center_y) * self.scale
        return svg_x, svg_y

    def save(self, mode='video'):
        if not self.all_points: return
        self._calculate_transform()
        
        suffix = ""
        if mode == 'start': suffix = "_start"
        elif mode == 'end': suffix = "_end"
        
        filename_with_suffix = self.filename.replace(".svg", f"{suffix}.svg")
        
        svg_content = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.width} {self.height}" style="background-color: white;">',
            '<style>',
            '@import url("https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,700;1,400&amp;display=swap");',
            'text { font-family: "Crimson Text", "Times New Roman", serif; font-weight: bold; }',
            '.math-it { font-family: "Times New Roman", Times, serif; font-style: italic; font-weight: normal; }',
            '</style>'
        ]
        
        for elem_func in self.elements:
            svg_content.append(elem_func(mode))
            
        svg_content.append('</svg>')
        
        save_path = os.path.join(OUTPUT_DIR, filename_with_suffix)
        with open(save_path, 'w', encoding='utf-8') as f:
            f.write("\n".join(svg_content))
        print(f"Saved: {save_path}")

    # --- Drawing Methods ---
    def draw_line(self, p1, p2, color='#000000', lw=2.5, linestyle='-'):
        self._track_points([p1, p2])
        self.elements.append(lambda mode: self._render_line(p1, p2, color, lw, linestyle))

    def _render_line(self, p1, p2, color, lw, linestyle):
        x1, y1 = self._transform(*p1)
        x2, y2 = self._transform(*p2)
        stroke_dash = 'stroke-dasharray="5,5"' if linestyle == '--' else ''
        return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{lw}" {stroke_dash} stroke-linecap="round" />'

    def draw_polygon(self, points, color='#000000', fill='none', alpha=1.0):
        self._track_points(points)
        self.elements.append(lambda mode: self._render_polygon(points, color, fill, alpha))

    def _render_polygon(self, points, color, fill, alpha):
        svg_points = " ".join([f"{self._transform(*p)[0]},{self._transform(*p)[1]}" for p in points])
        fill_color = fill if fill else "none"
        return f'<polygon points="{svg_points}" stroke="{color}" stroke-width="2.5" fill="{fill_color}" fill-opacity="{alpha}" stroke-linejoin="round" />'

    def draw_circle(self, center, radius, color='red', lw=2.5, animate=True, delay=0.0):
        self._track_points([(center[0]-radius, center[1]-radius), (center[0]+radius, center[1]+radius)])
        self.elements.append(lambda mode: self._render_circle(center, radius, color, lw, animate, delay, mode))

    def _render_circle(self, center, radius, color, lw, animate, delay, mode):
        cx, cy = self._transform(*center)
        r = radius * self.scale
        circle_len = 2 * math.pi * r
        
        style = ""
        anim_attrs = ""
        opacity = "1"

        if animate:
            if mode == 'video':
                style = f'stroke-dasharray: {circle_len}; stroke-dashoffset: {circle_len};'
                anim_attrs = f'<animate attributeName="stroke-dashoffset" from="{circle_len}" to="0" begin="{delay}s" dur="0.5s" fill="freeze" />'
            elif mode == 'start':
                opacity = "0"
            elif mode == 'end':
                opacity = "1"
        
        return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{color}" stroke-width="{lw}" opacity="{opacity}" style="{style}">{anim_attrs}</circle>'

    def add_text(self, p, text, offset=(0, 0), fontsize=20, color='black', animate=False, delay=0.0):
        pos = (p[0] + offset[0], p[1] + offset[1])
        self._track_points([(pos[0], pos[1])])
        self.elements.append(lambda mode: self._render_text(pos, text, fontsize, color, animate, delay, mode))

    def _render_text(self, pos, text, fontsize, color, animate, delay, mode):
        x, y = self._transform(*pos)
        is_math = "$" in text
        clean_text = text.replace("$", "")
        font_class = 'class="math-it"' if is_math else ''
        
        opacity = "1"
        anim_tag = ""
        
        if animate:
            if mode == 'video':
                opacity = "0"
                anim_tag = f'<animate attributeName="opacity" from="0" to="1" begin="{delay}s" dur="0.5s" fill="freeze" />'
            elif mode == 'start':
                opacity = "0"
            elif mode == 'end':
                opacity = "1"

        return f'<text x="{x}" y="{y}" font-size="{fontsize}" fill="{color}" text-anchor="middle" dominant-baseline="middle" opacity="{opacity}" {font_class}>{clean_text}{anim_tag}</text>'

    def add_angle_arc(self, p_center, p_start, p_end, text=None, radius=0.5, color='black', fontsize=20, text_color=None, text_offset=(0,0), animate=True, delay=0.0):
        if text_color is None: text_color = color
        
        v1 = np.array(p_start) - np.array(p_center)
        v2 = np.array(p_end) - np.array(p_center)
        angle1 = np.degrees(np.arctan2(v1[1], v1[0]))
        angle2 = np.degrees(np.arctan2(v2[1], v2[0]))
        if angle2 < angle1: angle2 += 360
        width = angle2 - angle1
        if width > 360: width -= 360
        if width > 180: angle1, angle2 = angle2, angle1 + 360
        
        mid_angle = np.radians(angle1 + width/2)
        arc_mid_point = (p_center[0] + radius * np.cos(mid_angle), p_center[1] + radius * np.sin(mid_angle))
        self._track_points([p_center, arc_mid_point])

        if text:
            base_r = radius * 1.5
            text_pos = (p_center[0] + base_r * np.cos(mid_angle) + text_offset[0],
                        p_center[1] + base_r * np.sin(mid_angle) + text_offset[1])
            self.add_text(text_pos, text, fontsize=fontsize, color=text_color, animate=animate, delay=delay)

        self.elements.append(lambda mode: self._render_arc(p_center, radius, angle1, angle2, color, animate, delay, mode))

    def _render_arc(self, center, radius, start_angle_deg, end_angle_deg, color, animate, delay, mode):
        cx, cy = self._transform(*center)
        r = radius * self.scale
        t1, t2 = np.radians(start_angle_deg), np.radians(end_angle_deg)
        p1_math = (center[0] + radius * np.cos(t1), center[1] + radius * np.sin(t1))
        p2_math = (center[0] + radius * np.cos(t2), center[1] + radius * np.sin(t2))
        x1, y1 = self._transform(*p1_math)
        x2, y2 = self._transform(*p2_math)
        large_arc = 1 if (end_angle_deg - start_angle_deg) > 180 else 0
        path_d = f"M {x1} {y1} A {r} {r} 0 {large_arc} 0 {x2} {y2}"
        
        style = ""
        anim_attrs = ""
        opacity = "1"

        if animate:
            if mode == 'video':
                # 線画アニメーション
                arc_len = 2 * math.pi * r * ((end_angle_deg - start_angle_deg)/360)
                style = f'stroke-dasharray: {arc_len}; stroke-dashoffset: {arc_len};'
                anim_attrs = f'<animate attributeName="stroke-dashoffset" from="{arc_len}" to="0" begin="{delay}s" dur="0.5s" fill="freeze" />'
                
                # 色の上書きフェードイン（簡易的に線画アニメで表現するが、既存の上に描く場合はopacityアニメの方が自然な場合もある。
                # ここでは統一して線画アニメーション（出現）とする。色が違う線が上から描かれることで色が変わったように見える）
            elif mode == 'start':
                opacity = "0"
            elif mode == 'end':
                opacity = "1"

        return f'<path d="{path_d}" fill="none" stroke="{color}" stroke-width="2" opacity="{opacity}" style="{style}">{anim_attrs}</path>'

    def add_tick_mark(self, p1, p2, num_marks=1):
        mid = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)
        vec = np.array(p2) - np.array(p1)
        length = np.linalg.norm(vec)
        if length == 0: return
        perp = np.array([-vec[1], vec[0]]) / length * 0.15
        for i in range(num_marks):
            offset = (i - (num_marks-1)/2) * 0.1
            base = (mid[0] + vec[0]/length*offset, mid[1] + vec[1]/length*offset)
            m1, m2 = (base[0] + perp[0], base[1] + perp[1]), (base[0] - perp[0], base[1] - perp[1])
            self.draw_line(m1, m2, lw=1)
            
    def get_circle_radius_for_text(self, fontsize):
        if self.max_x == float('-inf'): return 0.5
        data_h = (self.max_y - self.min_y)
        if data_h == 0: data_h = 4
        est_scale = (self.height * 0.9) / data_h
        return (fontsize * 1.25) / est_scale
    
    def get_arc_text_pos(self, p_center, p_start, p_end, radius, text_offset=(0,0)):
        v1 = np.array(p_start) - np.array(p_center)
        v2 = np.array(p_end) - np.array(p_center)
        angle1 = np.degrees(np.arctan2(v1[1], v1[0]))
        angle2 = np.degrees(np.arctan2(v2[1], v2[0]))
        if angle2 < angle1: angle2 += 360
        width = angle2 - angle1
        if width > 360: width -= 360
        if width > 180: angle1, angle2 = angle2, angle1 + 360
        mid_angle = np.radians(angle1 + width/2)
        base_r = radius * 1.5
        text_pos = (p_center[0] + base_r * np.cos(mid_angle) + text_offset[0],
                    p_center[1] + base_r * np.sin(mid_angle) + text_offset[1])
        return text_pos


def solve_full_request():
    # --- 図形定義 ---
    # 底角65度 (130/2 = 65 -> 外角115? いや、頂点Aの外角130 -> 内角50 -> 底角(180-50)/2 = 65)
    B, C = (1, 0), (4, 0) # 底辺3
    height = (3 / 2) * np.tan(np.radians(65))
    A = (2.5, height)
    
    # DはB->Aの延長
    vec_BA = np.array(A) - np.array(B)
    D = np.array(A) + vec_BA * 0.5

    BASE_FONT = 24
    X_FONT = BASE_FONT * 1.25

    # ベース描画関数
    def draw_base_figure(plot):
        plot.draw_polygon([A, B, C])
        plot.draw_line(A, D)
        plot.add_text(A, "A", (-0.2, 0))
        plot.add_text(B, "B", (-0.3, -0.1))
        plot.add_text(C, "C", (0.3, -0.1))
        plot.add_tick_mark(A, B, 2)
        plot.add_tick_mark(A, C, 2)

    # --- ① 元の黒の図形から、xに赤丸をつける ---
    plot1 = SVGGeometryPlotter("req01_x_red_circle.svg")
    draw_base_figure(plot1)
    
    # 静的要素: 130(黒), x(黒)
    plot1.add_angle_arc(A, C, D, "130°", radius=0.6, color='black', fontsize=BASE_FONT, text_color='black', animate=False)
    plot1.add_angle_arc(B, C, A, "$x$", radius=0.5, color='black', fontsize=X_FONT, text_color='black', animate=False)
    
    # アニメ: xに赤丸
    plot1._track_points([A, B, C]) # 範囲確定用
    pos_x = plot1.get_arc_text_pos(B, C, A, radius=0.5)
    r_x = plot1.get_circle_radius_for_text(X_FONT)
    plot1.draw_circle(pos_x, radius=r_x, color='red', lw=3, animate=True, delay=0.5)
    
    plot1.save('video')
    plot1.save('start')
    plot1.save('end')


    # --- ② 元の黒い図形から、Aの外角の円弧とラベル(130°)を赤にする ---
    plot2 = SVGGeometryPlotter("req02_130_red.svg")
    draw_base_figure(plot2)
    
    # 静的: x(黒)
    plot2.add_angle_arc(B, C, A, "$x$", radius=0.5, color='black', fontsize=X_FONT, text_color='black', animate=False)
    # 静的: 130(黒) - Start用
    plot2.add_angle_arc(A, C, D, "130°", radius=0.6, color='black', fontsize=BASE_FONT, text_color='black', animate=False)
    
    # アニメ: 130(赤) - 上書き
    plot2.add_angle_arc(A, C, D, "130°", radius=0.6, color='red', fontsize=BASE_FONT, text_color='red', animate=True, delay=0.5)
    
    plot2.save('video')
    plot2.save('start')
    plot2.save('end')


    # --- ③ ②の続きで角ABCを青に、角ACBにも青の円弧とxのラベルを追加 ---
    plot3 = SVGGeometryPlotter("req03_blue_angles.svg")
    draw_base_figure(plot3)
    
    # 静的: 130(赤) -> ②の続きなので
    plot3.add_angle_arc(A, C, D, "130°", radius=0.6, color='red', fontsize=BASE_FONT, text_color='red', animate=False)
    # 静的: ABC(黒) -> Start用
    plot3.add_angle_arc(B, C, A, "$x$", radius=0.5, color='black', fontsize=X_FONT, text_color='black', animate=False)
    
    # アニメ1: ABCを青に (0.5s~)
    plot3.add_angle_arc(B, C, A, "$x$", radius=0.5, color='blue', fontsize=X_FONT, text_color='blue', animate=True, delay=0.5)
    
    # アニメ2: ACBに青xを追加 (1.0s~)
    plot3.add_angle_arc(C, A, B, "$x$", radius=0.5, color='blue', fontsize=X_FONT, text_color='blue', animate=True, delay=1.0)
    
    plot3.save('video')
    plot3.save('start')
    plot3.save('end')


    # --- ④ ③の続きで、x二つに青丸、130°に赤丸をつける ---
    plot4 = SVGGeometryPlotter("req04_all_circles.svg")
    draw_base_figure(plot4)
    
    # 静的: 130(赤), ABC(青), ACB(青) -> ③の続き
    plot4.add_angle_arc(A, C, D, "130°", radius=0.6, color='red', fontsize=BASE_FONT, text_color='red', animate=False)
    plot4.add_angle_arc(B, C, A, "$x$", radius=0.5, color='blue', fontsize=X_FONT, text_color='blue', animate=False)
    plot4.add_angle_arc(C, A, B, "$x$", radius=0.5, color='blue', fontsize=X_FONT, text_color='blue', animate=False)
    
    # 座標計算
    plot4._track_points([A, B, C])
    pos_B = plot4.get_arc_text_pos(B, C, A, radius=0.5)
    pos_C = plot4.get_arc_text_pos(C, A, B, radius=0.5)
    pos_130 = plot4.get_arc_text_pos(A, C, D, radius=0.6)
    
    r_x = plot4.get_circle_radius_for_text(X_FONT)
    r_num = plot4.get_circle_radius_for_text(BASE_FONT)
    
    # アニメ: 丸付け
    plot4.draw_circle(pos_B, radius=r_x, color='blue', lw=3, animate=True, delay=0.5)
    plot4.draw_circle(pos_C, radius=r_x, color='blue', lw=3, animate=True, delay=1.0)
    plot4.draw_circle(pos_130, radius=r_num, color='red', lw=3, animate=True, delay=1.5)
    
    plot4.save('video')
    plot4.save('start')
    plot4.save('end')

if __name__ == "__main__":
    solve_full_request()
    print("All requested files generated in 'output_prob04_requests'.")