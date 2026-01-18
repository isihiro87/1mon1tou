import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# 数式フォントをTeX風(Computer Modern)にする設定
plt.rcParams['mathtext.fontset'] = 'cm'

# 出力ディレクトリの作成
OUTPUT_DIR = "math_problems_centered"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

class GeometryPlotter:
    def __init__(self, filename):
        self.fig, self.ax = plt.subplots(figsize=(6, 6))
        self.ax.set_aspect('equal')
        self.ax.axis('off')
        self.filename = filename
        self.all_points = []

    def _track_points(self, points):
        if isinstance(points, list):
            self.all_points.extend(points)
        else:
            self.all_points.append(points)

    def set_optimal_limits(self):
        if not self.all_points:
            return

        points = np.array(self.all_points)
        min_x, min_y = np.min(points, axis=0)
        max_x, max_y = np.max(points, axis=0)

        width = max_x - min_x
        height = max_y - min_y
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2

        max_range = max(width, height)
        # Reduced margin to make figures larger as requested
        margin = max_range * 0.02 
        if margin == 0: margin = 0.5

        padded_range = max_range + 2 * margin

        self.ax.set_xlim(center_x - padded_range / 2, center_x + padded_range / 2)
        self.ax.set_ylim(center_y - padded_range / 2, center_y + padded_range / 2)

    def save(self):
        self.set_optimal_limits()
        plt.tight_layout()
        save_path = os.path.join(OUTPUT_DIR, self.filename)
        plt.savefig(save_path, dpi=150, bbox_inches='tight', pad_inches=0.1)
        plt.close()
        print(f"Saved: {save_path}")

    def draw_line(self, p1, p2, color='#000000', lw=2.5, linestyle='-'):
        self.ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=lw, linestyle=linestyle)
        self._track_points([p1, p2])

    def draw_polygon(self, points, color='#000000', fill=None, alpha=1.0):
        poly = patches.Polygon(points, closed=True, edgecolor=color, facecolor=fill if fill else 'none', alpha=alpha, linewidth=2.5)
        self.ax.add_patch(poly)
        self._track_points(points)

    def add_text(self, p, text, offset=(0, 0), fontsize=20, color='black'):
        final_fontsize = 24 if text == "$x$" else fontsize
        pos = (p[0] + offset[0], p[1] + offset[1])
        self.ax.text(pos[0], pos[1], text, fontsize=final_fontsize, ha='center', va='center', color=color)
        self._track_points([(pos[0]-0.2, pos[1]-0.2), (pos[0]+0.2, pos[1]+0.2)])

    def add_angle_arc(self, p_center, p_start, p_end, text=None, radius=0.5, color='black', fontsize=16, text_color=None, text_offset=(0,0)):
        if text_color is None:
            text_color = color
            
        v1 = np.array(p_start) - np.array(p_center)
        v2 = np.array(p_end) - np.array(p_center)
        angle1 = np.degrees(np.arctan2(v1[1], v1[0]))
        angle2 = np.degrees(np.arctan2(v2[1], v2[0]))
        
        if angle2 < angle1:
            angle2 += 360
            
        width = angle2 - angle1
        if width > 360: width -= 360

        if width > 180:
             angle1, angle2 = angle2, angle1 + 360
             width = 360 - width

        arc = patches.Arc(p_center, radius*2, radius*2, angle=0, theta1=angle1, theta2=angle2, color=color, linewidth=2)
        self.ax.add_patch(arc)
        
        mid_angle = np.radians(angle1 + width/2)
        arc_mid_point = (p_center[0] + radius * np.cos(mid_angle),
                         p_center[1] + radius * np.sin(mid_angle))
        self._track_points([p_center, arc_mid_point])

        if text:
            # Base position at radius * 1.5
            base_r = radius * 1.5
            text_pos = (p_center[0] + base_r * np.cos(mid_angle) + text_offset[0],
                        p_center[1] + base_r * np.sin(mid_angle) + text_offset[1])
            
            final_fontsize = 24 if text == "$x$" else fontsize
            
            self.ax.text(text_pos[0], text_pos[1], text, fontsize=final_fontsize, color=text_color, ha='center', va='center')
            self._track_points([text_pos])

    def add_tick_mark(self, p1, p2, num_marks=1):
        mid = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2)
        vec = np.array(p2) - np.array(p1)
        length = np.linalg.norm(vec)
        if length == 0: return
        perp = np.array([-vec[1], vec[0]]) / length * 0.15
        
        for i in range(num_marks):
            offset = (i - (num_marks-1)/2) * 0.1
            base = (mid[0] + vec[0]/length*offset, mid[1] + vec[1]/length*offset)
            m1 = (base[0] + perp[0], base[1] + perp[1])
            m2 = (base[0] - perp[0], base[1] - perp[1])
            self.ax.plot([m1[0], m2[0]], [m1[1], m2[1]], 'k-', lw=1)
            self._track_points([m1, m2])

def get_isosceles_top(base_width, top_angle_deg, base_center=(2.5, 0)):
    height = (base_width / 2) / np.tan(np.radians(top_angle_deg / 2))
    return (base_center[0], height)

def get_isosceles_from_base_angle(base_width, base_angle_deg, base_center=(2.5, 0)):
    height = (base_width / 2) * np.tan(np.radians(base_angle_deg))
    return (base_center[0], height)

# --- Solution Generators ---

def solve_prob_03():
    # Common Geometry
    B, C = (1, 0), (4, 0)
    A = get_isosceles_from_base_angle(3, 70, ((1+4)/2, 0))
    D = (5.5, 0)

    # Original Image (All Black)
    plot = GeometryPlotter("problem_03_original.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(C, D, linestyle='-')
    plot.add_text(A, "A", (0, 0.3))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0, -0.3))
    
    plot.add_angle_arc(A, B, C, "$x$", radius=0.6)
    plot.add_angle_arc(C, D, A, "110°", radius=0.6)
    
    plot.add_tick_mark(A, B, 1)
    plot.add_tick_mark(A, C, 1)
    plot.save()
    
    # Step 1: Exterior C (110) in BLUE
    plot = GeometryPlotter("problem_03_step_1.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(C, D, linestyle='-')
    plot.add_text(A, "A", (0, 0.3))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0, -0.3))
    
    # Base Angle A (x) - radius 1.2x (0.5 * 1.2 = 0.6)
    plot.add_angle_arc(A, B, C, "$x$", radius=0.6)
    
    # Highlights
    plot.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', text_color='blue')
    
    plot.add_tick_mark(A, B, 1)
    plot.add_tick_mark(A, C, 1)
    plot.save()

    # Step 2: Interior C (70) in RED, different radius
    plot = GeometryPlotter("problem_03_step_2.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(C, D, linestyle='-')
    plot.add_text(A, "A", (0, 0.3))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0, -0.3))
    
    plot.add_angle_arc(A, B, C, "$x$", radius=0.6)
    plot.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', text_color='blue')
    
    # Highlights
    plot.add_angle_arc(C, A, B, "70°", radius=0.5, color='red', text_color='red')

    plot.add_tick_mark(A, B, 1)
    plot.add_tick_mark(A, C, 1)
    plot.save()

    # Step 3: Interior B and C (70) in RED
    plot = GeometryPlotter("problem_03_step_3.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(C, D, linestyle='-')
    plot.add_text(A, "A", (0, 0.3))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0, -0.3))
    
    plot.add_angle_arc(A, B, C, "$x$", radius=0.6)
    plot.add_angle_arc(C, D, A, "110°", radius=0.6, color='blue', text_color='blue')
    
    # Highlights
    plot.add_angle_arc(C, A, B, "70°", radius=0.5, color='red', text_color='red')
    plot.add_angle_arc(B, C, A, "70°", radius=0.5, color='red', text_color='red')

    plot.add_tick_mark(A, B, 1)
    plot.add_tick_mark(A, C, 1)
    plot.save()


def solve_prob_04():
    # Common Geometry
    B, C = (1, 0), (4, 0)
    A = get_isosceles_top(3, 50, ((1+4)/2, 0))
    vec_BA = np.array(A) - np.array(B)
    D = np.array(A) + vec_BA * 0.5

    # Original Image (All Black)
    plot = GeometryPlotter("problem_04_original.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(A, D, linestyle='-')
    plot.add_text(A, "A", (-0.2, 0))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0.3, -0.1))
    
    plot.add_angle_arc(A, C, D, "130°", radius=0.6)
    plot.add_angle_arc(B, C, A, "$x$", radius=0.5)

    plot.add_tick_mark(A, B, 2)
    plot.add_tick_mark(A, C, 2)
    plot.save()

    # Original Image with Red Exterior Angle
    plot = GeometryPlotter("problem_04_original_red.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(A, D, linestyle='-')
    plot.add_text(A, "A", (-0.2, 0))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0.3, -0.1))
    
    # Red 130
    plot.add_angle_arc(A, C, D, "130°", radius=0.6, color='red', text_color='red')
    plot.add_angle_arc(B, C, A, "$x$", radius=0.5)

    plot.add_tick_mark(A, B, 2)
    plot.add_tick_mark(A, C, 2)
    plot.save()
    
    # Step 1: Interior B and C (x) in BLUE
    plot = GeometryPlotter("problem_04_step_1.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(A, D, linestyle='-')
    plot.add_text(A, "A", (-0.2, 0))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0.3, -0.1))
    
    plot.add_angle_arc(A, C, D, "130°", radius=0.6)
    
    # Highlights
    plot.add_angle_arc(B, C, A, "$x$", radius=0.5, color='blue', text_color='blue')
    plot.add_angle_arc(C, A, B, "$x$", radius=0.5, color='blue', text_color='blue')

    plot.add_tick_mark(A, B, 2)
    plot.add_tick_mark(A, C, 2)
    plot.save()

    # Step 2: Step 1 + Exterior A (130) in RED
    plot = GeometryPlotter("problem_04_step_2.png")
    plot.draw_polygon([A, B, C])
    plot.draw_line(A, D, linestyle='-')
    plot.add_text(A, "A", (-0.2, 0))
    plot.add_text(B, "B", (-0.3, -0.1))
    plot.add_text(C, "C", (0.3, -0.1))
    
    # Highlights
    plot.add_angle_arc(B, C, A, "$x$", radius=0.5, color='blue', text_color='blue')
    plot.add_angle_arc(C, A, B, "$x$", radius=0.5, color='blue', text_color='blue')
    
    # Red 130
    plot.add_angle_arc(A, C, D, "130°", radius=0.6, color='red', text_color='red')

    plot.add_tick_mark(A, B, 2)
    plot.add_tick_mark(A, C, 2)
    plot.save()

def solve_prob_03_04_combined():
    plot = GeometryPlotter("problem_03_04_combined.png")
    
    # --- Problem 03 (Left) ---
    B3, C3 = (1, 0), (4, 0)
    A3 = get_isosceles_from_base_angle(3, 70, ((1+4)/2, 0))
    D3 = (5.5, 0)
    
    # Add Problem Number (1)
    # A3 height is approx 4.1. Put label at y=5.2 (moved up)
    # Fontsize 0.8x of 24 -> 19.2 -> 19
    plot.add_text((2.5, 5.2), "(1)", fontsize=19)
    
    plot.draw_polygon([A3, B3, C3])
    plot.draw_line(C3, D3, linestyle='-')
    plot.add_text(A3, "A", (0, 0.3))
    plot.add_text(B3, "B", (-0.3, -0.1))
    plot.add_text(C3, "C", (0, -0.3))
    
    # BAC arc radius 1.2x (0.6 * 1.2 = 0.72)
    plot.add_angle_arc(A3, B3, C3, "$x$", radius=0.72)
    
    # 110 deg text offset up (0.07 char ~ 0.035 units? Let's try 0.1 for visibility)
    # User said "文字の0.07倍". If char size is ~0.5, then 0.035.
    plot.add_angle_arc(C3, D3, A3, "110°", radius=0.6, text_offset=(0, 0.1))
    
    plot.add_tick_mark(A3, B3, 1)
    plot.add_tick_mark(A3, C3, 1)
    
    # --- Problem 04 (Right) ---
    # Increased offset to 6.0 for more gap
    offset_x = 6.0
    offset = np.array([offset_x, 0])
    
    # Add Problem Number (2) aligned with (1)
    plot.add_text((2.5 + offset_x, 5.2), "(2)", fontsize=19)
    
    B4 = np.array((1, 0)) + offset
    C4 = np.array((4, 0)) + offset
    A4 = get_isosceles_top(3, 50, (2.5 + offset_x, 0))
    
    vec_BA4 = np.array(A4) - np.array(B4)
    D4 = np.array(A4) + vec_BA4 * 0.5
    
    plot.draw_polygon([A4, B4, C4])
    plot.draw_line(A4, D4, linestyle='-')
    
    # A position left by 0.15 char (~0.075 units) -> (-0.2 - 0.075 = -0.275)
    plot.add_text(A4, "A", (-0.275, 0))
    plot.add_text(B4, "B", (-0.3, -0.1))
    plot.add_text(C4, "C", (0.3, -0.1))
    
    # 130 deg text right by 1.5 char (~0.75 units)
    plot.add_angle_arc(A4, C4, D4, "130°", radius=0.6, text_offset=(0.75, 0))
    
    # x text away from B by 0.1 char (~0.05 units)
    # Direction is roughly bisector. B angle is (180-50)/2 = 65. Bisector is 32.5 deg.
    # Just adding offset in x/y might be enough or increasing radius.
    # "文字の0.1倍だけBから離して" -> Increase radius? Or shift?
    # Let's shift by (0.05, 0.05) roughly or just use offset.
    plot.add_angle_arc(B4, C4, A4, "$x$", radius=0.5, text_offset=(0.05, 0.05))
    
    plot.add_tick_mark(A4, B4, 2)
    plot.add_tick_mark(A4, C4, 2)
    
    plot.save()

if __name__ == "__main__":
    solve_prob_03()
    solve_prob_04()
    solve_prob_03_04_combined()
    print("Solution images generated in 'math_problems_centered' folder.")
