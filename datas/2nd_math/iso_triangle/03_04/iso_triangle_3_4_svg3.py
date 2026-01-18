import numpy as np
import os
import math

# 出力ディレクトリ
OUTPUT_DIR = "output_problem03_black_110"
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
                pass
        
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
                arc_len = 2 * math.pi * r * ((end_angle_deg - start_angle_deg)/360)
                style = f'stroke-dasharray: {arc_len}; stroke-dashoffset: {arc_len};'
                anim_attrs = f'<animate attributeName="stroke-dashoffset" from="{arc_len}" to="0" begin="{delay}s" dur="0.5s" fill="freeze" />'
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

def get_isosceles_from_base_angle(base_width, base_angle_deg, base_center=(2.5, 0)):
    height = (base_width / 2) * np.tan(np.radians(base_angle_deg))
    return (base_center[0], height)

def solve_prob_03_batch():
    B, C = (1, 0), (4, 0)
    A = get_isosceles_from_base_angle(3, 70, ((1+4)/2, 0))
    D = (5.5, 0)
    
    BASE_FONT = 28
    X_FONT = BASE_FONT * 1.25
    
    def draw_base(plot):
        plot.draw_polygon([A, B, C])
        plot.draw_line(C, D)
        plot.add_text(A, "A", (0, 0.3))
        plot.add_text(B, "B", (-0.3, -0.1))
        plot.add_text(C, "C", (0, -0.3))
        plot.add_tick_mark(A, B, 1)
        plot.add_tick_mark(A, C, 1)

    # シナリオ1
    plot1 = SVGGeometryPlotter("prob03_1_x_mark.svg")
    draw_base(plot1)
    plot1.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot1.add_angle_arc(C, D, A, "110°", radius=0.6, color='black', fontsize=BASE_FONT, text_color='black', animate=False)
    
    text_y_offset = 0.6 * 1.5
    text_pos_x = (A[0], A[1] - text_y_offset)
    plot1._track_points([A, B, C, D]) 
    r_x = plot1.get_circle_radius_for_text(X_FONT)
    plot1.draw_circle(text_pos_x, radius=r_x, color='red', lw=3, animate=True, delay=0.5)
    
    plot1.save('video')
    plot1.save('start')
    plot1.save('end')

    # シナリオ2
    plot2 = SVGGeometryPlotter("prob03_2_110_mark.svg")
    draw_base(plot2)
    plot2.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot2.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', fontsize=BASE_FONT, text_color='blue', animate=False)
    
    v1 = np.array(D) - np.array(C)
    v2 = np.array(A) - np.array(C)
    mid_angle_rad = np.radians((0 + 110)/2)
    text_dist = 0.6 * 1.5
    text_pos_110 = (C[0] + text_dist * np.cos(mid_angle_rad), C[1] + text_dist * np.sin(mid_angle_rad))
    
    plot2._track_points([A, B, C, D])
    r_110 = plot2.get_circle_radius_for_text(BASE_FONT)
    plot2.draw_circle(text_pos_110, radius=r_110, color='red', lw=3, animate=True, delay=0.5)
    
    plot2.save('video')
    plot2.save('start')
    plot2.save('end')

    # シナリオ2.5 (180°のアニメーション)
    plot2_5 = SVGGeometryPlotter("prob03_2_5_180_deg.svg")
    draw_base(plot2_5)
    plot2_5.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot2_5.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', fontsize=BASE_FONT, text_color='blue', animate=False)
    
    # 180度のアニメーション
    # 半径: 0.5 * 0.9 = 0.45 (10%小さく)
    # 色: 赤
    # 位置: 3文字分左(-0.75)、70%分下(-0.17) ※座標スケールから概算
    plot2_5.add_angle_arc(C, D, B, "180°", radius=0.45, color='red', fontsize=BASE_FONT, text_color='red', text_offset=(-0.75, -0.17), animate=True, delay=0.5)
    
    plot2_5.save('video')
    plot2_5.save('start')
    plot2_5.save('end')

    # シナリオ3
    plot3 = SVGGeometryPlotter("prob03_3_C_inner.svg")
    draw_base(plot3)
    plot3.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot3.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', fontsize=BASE_FONT, text_color='blue', animate=False)
    plot3.add_angle_arc(C, A, B, "70°", radius=0.5, color='red', fontsize=BASE_FONT, text_color='red', animate=True, delay=0.5)
    
    plot3.save('video')
    plot3.save('start')
    plot3.save('end')

    # シナリオ4
    plot4 = SVGGeometryPlotter("prob03_4_B_inner.svg")
    draw_base(plot4)
    plot4.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot4.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', fontsize=BASE_FONT, text_color='blue', animate=False)
    plot4.add_angle_arc(C, A, B, "70°", radius=0.5, color='red', fontsize=BASE_FONT, text_color='red', animate=False)
    plot4.add_angle_arc(B, C, A, "70°", radius=0.5, color='red', fontsize=BASE_FONT, text_color='red', animate=True, delay=0.5)
    
    plot4.save('video')
    plot4.save('start')
    plot4.save('end')

    # シナリオ5 (prob03_4の状態に、両方の70°ラベルを赤丸で囲むアニメーション)
    plot5 = SVGGeometryPlotter("prob03_5_both_70_circled.svg")
    draw_base(plot5)
    plot5.add_angle_arc(A, B, C, "$x$", radius=0.6, fontsize=X_FONT, animate=False)
    plot5.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', fontsize=BASE_FONT, text_color='blue', animate=False)
    plot5.add_angle_arc(C, A, B, "70°", radius=0.5, color='red', fontsize=BASE_FONT, text_color='red', animate=False)
    plot5.add_angle_arc(B, C, A, "70°", radius=0.5, color='red', fontsize=BASE_FONT, text_color='red', animate=False)
    
    plot5._track_points([A, B, C, D])
    r_circle = plot5.get_circle_radius_for_text(BASE_FONT)
    text_r_offset = 0.5 * 1.5
    
    # 左側(B)の70°ラベル
    ang_B_rad = np.radians(35)
    pos_B_text = (B[0] + text_r_offset * np.cos(ang_B_rad), B[1] + text_r_offset * np.sin(ang_B_rad))
    
    # 右側(C)の70°ラベル
    ang_C_rad = np.radians(145)
    pos_C_text = (C[0] + text_r_offset * np.cos(ang_C_rad), C[1] + text_r_offset * np.sin(ang_C_rad))
    
    # 右(C) -> 左(B) の順で赤丸アニメーション
    plot5.draw_circle(pos_C_text, radius=r_circle, color='red', lw=3, animate=True, delay=0.5)
    plot5.draw_circle(pos_B_text, radius=r_circle, color='red', lw=3, animate=True, delay=1.0) # 右が終わった後(0.5s後)に開始
    
    plot5.save('video')
    plot5.save('start')
    plot5.save('end')

if __name__ == "__main__":
    solve_prob_03_batch()
    print("All files generated in 'output_problem03_black_110'.")