import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# --- 設定 ---
# 数式フォントをTeX風にする
plt.rcParams['mathtext.fontset'] = 'cm'

# 【重要】日本語フォントの設定
plt.rcParams['font.family'] = ['MS Gothic', 'sans-serif']

# カラー定数
RED_SIDE = '#FF4B4B'      # 辺の強調色（赤）
RED_ANGLE = RED_SIDE      # 角の強調色（赤）
BLUE_ANGLE = '#4B4BFF'    # 角の強調色（青：既知の情報・底角）
MAGENTA_TARGET = '#FF00FF' # ターゲットxの強調色
BLACK = '#000000'

# 出力ディレクトリ
OUTPUT_DIR = "math_shorts_assets_v3" # 出力先を変更
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# --- Plotter Class ---

class GeometryPlotter:
    def __init__(self, filename=None, ax=None):
        self.filename = filename
        self.all_points = [] 
        
        if ax is None:
            self.fig, self.ax = plt.subplots(figsize=(6, 6))
            self.own_fig = True
        else:
            self.ax = ax
            self.fig = ax.figure
            self.own_fig = False

        self.ax.set_aspect('equal')
        self.ax.axis('off')

    def _track_points(self, points):
        if isinstance(points, list):
            self.all_points.extend(points)
        else:
            self.all_points.append(points)

    # 余白率のデフォルトを小さく変更 (0.05)
    def set_optimal_limits(self, margin_ratio=0.05):
        if not self.all_points: return
        points = np.array(self.all_points)
        min_x, min_y = np.min(points, axis=0)
        max_x, max_y = np.max(points, axis=0)
        width = max_x - min_x
        height = max_y - min_y
        
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        max_range = max(width, height)
        
        margin = max_range * margin_ratio
        if margin == 0: margin = 0.1
        padded_range = max_range + 2 * margin

        self.ax.set_xlim(center_x - padded_range / 2, center_x + padded_range / 2)
        self.ax.set_ylim(center_y - padded_range / 2, center_y + padded_range / 2)

    def save(self):
        if not self.own_fig: return
        # 保存時の余白も小さく設定 (0.05)
        self.set_optimal_limits(margin_ratio=0.05)
        plt.tight_layout()
        save_path = os.path.join(OUTPUT_DIR, self.filename)
        plt.savefig(save_path, dpi=200, bbox_inches='tight', pad_inches=0.05)
        plt.close()

    # --- 基本描画 ---
    def draw_line(self, p1, p2, color=BLACK, lw=2.5, linestyle='-', zorder=1):
        self.ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=lw, linestyle=linestyle, zorder=zorder)
        self._track_points([p1, p2])

    def draw_polygon(self, points, color=BLACK, fill=None, alpha=1.0, lw=2.5, zorder=1):
        poly = patches.Polygon(points, closed=True, edgecolor=color, facecolor=fill if fill else 'none', alpha=alpha, linewidth=lw, zorder=zorder)
        self.ax.add_patch(poly)
        self._track_points(points)

    # --- 強調描画 ---
    def highlight_line(self, p1, p2, color=RED_SIDE, lw=5.0):
        self.ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color=color, lw=lw, zorder=2)

    def highlight_arc(self, p_center, p_start, p_end, color=BLUE_ANGLE, lw=3, radius=0.5):
        self._draw_arc(p_center, p_start, p_end, color=color, lw=lw, radius=radius, zorder=3)

    # --- テキスト・記号 ---
    def add_text(self, p, text, offset=(0, 0), fontsize=20, color=BLACK, fontweight='normal', zorder=5):
        pos = (p[0] + offset[0], p[1] + offset[1])
        self.ax.text(pos[0], pos[1], text, fontsize=fontsize, ha='center', va='center', color=color, fontweight=fontweight, zorder=zorder)
        # テキスト位置は追跡しない（枠を広げすぎないため）
        # self._track_points([(pos[0], pos[1])])

    def add_angle_text(self, p_center, p_start, p_end, text, offset=(0, 0), radius=0.5, color=BLACK, fontsize=20, fontweight='normal'):
        v1 = np.array(p_start) - np.array(p_center)
        v2 = np.array(p_end) - np.array(p_center)
        angle1 = np.degrees(np.arctan2(v1[1], v1[0]))
        angle2 = np.degrees(np.arctan2(v2[1], v2[0]))
        if angle2 < angle1: angle2 += 360
        width = angle2 - angle1
        if width > 180: angle1, angle2 = angle2, angle1 + 360
        mid_angle = np.radians(angle1 + width/2)

        # 基準位置の計算（radiusをそのまま使うように変更し、呼び出し側で調整させる）
        base_r = radius 
        text_pos_x = p_center[0] + base_r * np.cos(mid_angle) + offset[0]
        text_pos_y = p_center[1] + base_r * np.sin(mid_angle) + offset[1]
        
        if "$x$" in text:
            final_size = 28
            final_weight = 'bold'
        elif any("\u4e00" <= c <= "\u9fff" for c in text): # 日本語
            final_size = 28
            final_weight = 'bold'
        else:
            final_size = fontsize
            final_weight = fontweight

        self.ax.text(text_pos_x, text_pos_y, text, fontsize=final_size, color=color, ha='center', va='center', fontweight=final_weight, zorder=5)
        # テキスト位置は追跡しない

    def add_tick_mark(self, p1, p2, num_marks=1, color=BLACK, lw=1.5):
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
            self.ax.plot([m1[0], m2[0]], [m1[1], m2[1]], color=color, lw=lw, zorder=3)
            self._track_points([m1, m2])

    def _draw_arc(self, p_center, p_start, p_end, color=BLACK, lw=1, radius=0.5, zorder=1):
        v1 = np.array(p_start) - np.array(p_center)
        v2 = np.array(p_end) - np.array(p_center)
        angle1 = np.degrees(np.arctan2(v1[1], v1[0]))
        angle2 = np.degrees(np.arctan2(v2[1], v2[0]))
        if angle2 < angle1: angle2 += 360
        width = angle2 - angle1
        if width > 180: angle1, angle2 = angle2, angle1 + 360
        arc = patches.Arc(p_center, radius*2, radius*2, angle=0, theta1=angle1, theta2=angle2, color=color, linewidth=lw, zorder=zorder)
        self.ax.add_patch(arc)

# --- 幾何計算ヘルパー ---
def get_isosceles_top(base_width, top_angle_deg, base_center=(2.5, 0)):
    height = (base_width / 2) / np.tan(np.radians(top_angle_deg / 2))
    return (base_center[0], base_center[1] + height)

def get_isosceles_from_base_angle(base_width, base_angle_deg, base_center=(2.5, 0)):
    height = (base_width / 2) * np.tan(np.radians(base_angle_deg))
    return (base_center[0], base_center[1] + height)

def draw_base_labels(plot, A=None, B=None, C=None, D=None, E=None, M=None, N=None, O=None):
    # ラベル位置も少し内側に調整
    if A is not None: plot.add_text(A, "A", (0, 0.25))
    if B is not None: plot.add_text(B, "B", (-0.25, -0.15))
    if C is not None: plot.add_text(C, "C", (0.25, -0.15))
    if D is not None: plot.add_text(D, "D", (0, -0.25))

# ==========================================
# タスク: 二等辺三角形の性質（段階的表示）
# ==========================================

def run_isosceles_properties_step_by_step():
    print("Generating isosceles properties step-by-step images...")
    base_w = 5
    top_angle = 50
    
    B, C = (0, 0), (base_w, 0)
    A = get_isosceles_top(base_w, top_angle, (base_w/2, 0))
    
    # テキスト配置用の半径とオフセットを調整
    radius_arc = 0.7
    radius_text_top = 0.6
    offset_text_top = (0, -0.1)
    radius_text_base = 0.8
    offset_text_base_B = (0.35, 0.1)
    offset_text_base_C = (-0.35, 0.1)
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C])
        plot.add_tick_mark(A, B, 1)
        plot.add_tick_mark(A, C, 1)
        plot._draw_arc(A, B, C, radius=radius_arc+0.2)
        plot._draw_arc(B, C, A, radius=radius_arc)
        plot._draw_arc(C, A, B, radius=radius_arc)

        if step == 0: pass
        elif step == 1:
            plot.highlight_line(A, B, color=RED_SIDE)
            plot.highlight_line(A, C, color=RED_SIDE)
            plot.highlight_arc(A, B, C, color=RED_ANGLE, radius=radius_arc+0.2)
        elif step == 2:
            plot.highlight_line(A, B, color=RED_SIDE)
            plot.highlight_line(A, C, color=RED_SIDE)
            plot.highlight_arc(A, B, C, color=RED_ANGLE, radius=radius_arc+0.2)
            plot.add_angle_text(A, B, C, "頂角", radius=radius_text_top, offset=(0, -0.6), color=RED_ANGLE)
        elif step == 3:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=radius_arc)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=radius_arc)
        elif step == 4:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=radius_arc)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=radius_arc)
            plot.add_angle_text(B, C, A, "底角", radius=radius_text_base, offset=offset_text_base_B, color=BLUE_ANGLE)
            plot.add_angle_text(C, A, B, "底角", radius=radius_text_base, offset=offset_text_base_C, color=BLUE_ANGLE)

    for i in range(5):
        p = GeometryPlotter(f"isosceles_property_step{i}.png")
        draw(p, i)
        p.save()

# ==========================================
# タスク: Mixed Problem (01 & 02 Side by Side)
# ==========================================

def run_mixed_problem():
    print("Generating 01_02_mixed.png...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 10))
    
    BASE_Y = 0.0
    COMMON_Y_MIN = -0.5
    COMMON_Y_MAX = 6.5
    
    # Prob 1: Base 65 (Left)
    plot1 = GeometryPlotter(ax=ax1)
    base_w1 = 4; base_angle1 = 65
    B1, C1 = (0, BASE_Y), (base_w1, BASE_Y)
    A1 = get_isosceles_from_base_angle(base_w1, base_angle1, (base_w1/2, BASE_Y))
    plot1.draw_polygon([A1, B1, C1]); plot1.add_tick_mark(A1, B1, 1); plot1.add_tick_mark(A1, C1, 1)
    # ラベル位置調整
    plot1._draw_arc(B1, C1, A1, radius=0.6)
    plot1.add_angle_text(B1, C1, A1, "65°", radius=0.8, offset=(0.3, 0.1))
    plot1._draw_arc(A1, B1, C1, radius=0.6)
    plot1.add_angle_text(A1, B1, C1, "$x$", radius=0.8, offset=(0, 0))
    
    plot1.set_optimal_limits(margin_ratio=0.05)
    plot1.ax.set_ylim(COMMON_Y_MIN, COMMON_Y_MAX)
    plot1.ax.set_xlim(-0.5, base_w1 + 0.5)
    plot1.ax.text(0.5, 0.95, "(1)", transform=plot1.ax.transAxes, fontsize=28, ha='center', fontweight='bold')

    # Prob 2: Top 40 (Right)
    plot2 = GeometryPlotter(ax=ax2)
    base_w2 = 4; top_angle2 = 40
    B2, C2 = (0, BASE_Y), (base_w2, BASE_Y)
    A2 = get_isosceles_top(base_w2, top_angle2, (base_w2/2, BASE_Y))
    plot2.draw_polygon([A2, B2, C2]); plot2.add_tick_mark(A2, B2, 1); plot2.add_tick_mark(A2, C2, 1)
    # ラベル位置調整
    plot2._draw_arc(A2, B2, C2, radius=0.8)
    plot2.add_angle_text(A2, B2, C2, "40°", radius=0.7, offset=(0.10, -0.4))
    plot2._draw_arc(B2, C2, A2, radius=0.6)
    plot2.add_angle_text(B2, C2, A2, "$x$", radius=0.6, offset=(0.2, 0.1))
    
    plot2.set_optimal_limits(margin_ratio=0.05)
    plot2.ax.set_ylim(COMMON_Y_MIN, COMMON_Y_MAX)
    plot2.ax.set_xlim(-0.5, base_w2 + 0.5)
    plot2.ax.text(0.5, 0.95, "(2)", transform=plot2.ax.transAxes, fontsize=28, ha='center', fontweight='bold')
    
    plt.tight_layout(pad=0.5, w_pad=1.0)
    save_path = os.path.join(OUTPUT_DIR, "01_02_mixed.png")
    plt.savefig(save_path, dpi=200, bbox_inches='tight', pad_inches=0.05)
    plt.close()

# ==========================================
# 問題 1～5 の生成
# ==========================================

def run_prob_01():
    # Base 65 degree problem
    B, C = (1, 0), (4, 0)
    A = get_isosceles_from_base_angle(3, 65, ((1+4)/2, 0))
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C])
        draw_base_labels(plot, A, B, C)
        
        col_side = RED_SIDE if step == 1 else BLACK
        if step == 1: plot.highlight_line(A, B); plot.highlight_line(A, C)
        plot.add_tick_mark(A, B, 1, color=col_side); plot.add_tick_mark(A, C, 1, color=col_side)
        
        # 位置調整
        if step >= 2:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(B, C, A, "65°", radius=0.8, color=BLUE_ANGLE, offset=(0.15, 0))
        else:
            plot._draw_arc(B, C, A, radius=0.6)
            plot.add_angle_text(B, C, A, "65°", radius=0.8, offset=(0.15, 0))
        
        target_col = MAGENTA_TARGET if step == 3 else BLACK
        plot._draw_arc(A, B, C, radius=0.6, color=target_col if step==3 else BLACK)
        plot.add_angle_text(A, B, C, "$x$", radius=0.7, color=target_col)
        
        if step >= 2 and step != 4:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(C, A, B, "65°", radius=0.8, color=BLUE_ANGLE)

    for i in range(5):
        p = GeometryPlotter(f"prob_01_step{i}.png"); draw(p, i); p.save()

def run_prob_02():
    # Top 40 degree problem
    B, C = (1, 0), (4, 0)
    A = get_isosceles_top(3, 40, ((1+4)/2, 0))
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C])
        draw_base_labels(plot, A, B, C)
        
        col_side = RED_SIDE if step == 1 else BLACK
        if step == 1: plot.highlight_line(A, B); plot.highlight_line(A, C)
        plot.add_tick_mark(A, B, 1, color=col_side); plot.add_tick_mark(A, C, 1, color=col_side)
        
        # 位置調整
        if step == 4:
            plot.highlight_arc(A, B, C, color=RED_ANGLE, radius=0.8)
            plot.add_angle_text(A, B, C, "40°", radius=0.7, offset=(0.1, -0.4), color=RED_ANGLE)
        else:
            plot._draw_arc(A, B, C, radius=0.8)
            plot.add_angle_text(A, B, C, "40°", radius=0.7, offset=(0.1, -0.4))
        
        target_col = MAGENTA_TARGET if step == 3 else BLACK
        plot._draw_arc(B, C, A, radius=0.6, color=target_col if step==3 else BLACK)
        plot.add_angle_text(B, C, A, "$x$", radius=0.6, offset=(0.2, 0.15), color=target_col)
        
        if step >= 2 and step != 4:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(B, C, A, "$x$", radius=0.6, offset=(0.2, 0.15), color=BLUE_ANGLE)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(C, A, B, "$x$", radius=0.6, offset=(-0.2, 0.15), color=BLUE_ANGLE)

    for i in range(5):
        p = GeometryPlotter(f"prob_02_step{i}.png"); draw(p, i); p.save()

def run_prob_03():
    B, C = (1, 0), (4, 0)
    A = get_isosceles_from_base_angle(3, 70, ((1+4)/2, 0))
    D = (5.5, 0)
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C]); plot.draw_line(C, D)
        draw_base_labels(plot, A, B, C)
        
        col_side = RED_SIDE if step == 1 else BLACK
        if step == 1: plot.highlight_line(A, B); plot.highlight_line(A, C)
        plot.add_tick_mark(A, B, 1, color=col_side); plot.add_tick_mark(A, C, 1, color=col_side)
        
        # 位置調整
        plot._draw_arc(C, D, A, radius=0.5)
        plot.add_angle_text(C, D, A, "110°", radius=0.7, offset=(0.3, 0.1))
        
        target_col = MAGENTA_TARGET if step == 3 else BLACK
        plot._draw_arc(B, C, A, radius=0.6, color=target_col if step==3 else BLACK)
        plot.add_angle_text(B, C, A, "$x$", radius=0.8, offset=(0.1, 0.2), color=target_col)
        
        if step >= 2:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(C, A, B, "70°", radius=0.8, offset=(-0.1, 0.2), color=BLUE_ANGLE)

    for i in range(4):
        p = GeometryPlotter(f"prob_03_step{i}.png"); draw(p, i); p.save()

def run_prob_04():
    B, C = (1, 0), (4, 0)
    A = get_isosceles_top(3, 50, ((1+4)/2, 0))
    vec_BA = np.array(A) - np.array(B)
    D = np.array(A) + vec_BA * 0.5
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C]); plot.draw_line(A, D)
        draw_base_labels(plot, A, B, C)
        
        col_side = RED_SIDE if step == 1 else BLACK
        if step == 1: plot.highlight_line(A, B); plot.highlight_line(A, C)
        plot.add_tick_mark(A, B, 2, color=col_side); plot.add_tick_mark(A, C, 2, color=col_side)
        
        # 位置調整
        plot._draw_arc(A, C, D, radius=0.5)
        plot.add_angle_text(A, C, D, "130°", radius=0.7, offset=(0.3, 0.1))
        
        target_col = MAGENTA_TARGET if step == 3 else BLACK
        plot._draw_arc(B, C, A, radius=0.6, color=target_col if step==3 else BLACK)
        plot.add_angle_text(B, C, A, "$x$", radius=0.8, offset=(0.1, 0.1), color=target_col)
        
        if step >= 2:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(C, A, B, "50°", radius=0.8, offset=(-0.1, 0.1), color=BLUE_ANGLE)

    for i in range(4):
        p = GeometryPlotter(f"prob_04_step{i}.png"); draw(p, i); p.save()

def run_prob_05():
    B, C = (1, 0), (4, 0)
    A = get_isosceles_top(3, 60, ((1+4)/2, 0))
    vec_BA = np.array(A) - np.array(B)
    D = np.array(A) + vec_BA * 0.5
    
    def draw(plot, step):
        plot.draw_polygon([A, B, C]); plot.draw_line(A, D)
        draw_base_labels(plot, A, B, C)
        
        col_side = RED_SIDE if step == 1 else BLACK
        if step == 1: plot.highlight_line(A, B); plot.highlight_line(A, C)
        plot.add_tick_mark(A, B, 1, color=col_side); plot.add_tick_mark(A, C, 1, color=col_side)
        
        # 位置調整
        plot._draw_arc(A, C, D, radius=0.5)
        plot.add_angle_text(A, C, D, "120°", radius=0.7, offset=(0.3, 0))
        
        target_col = MAGENTA_TARGET if step == 3 else BLACK
        plot._draw_arc(B, C, A, radius=0.6, color=target_col if step==3 else BLACK)
        plot.add_angle_text(B, C, A, "$x$", radius=0.8, offset=(0.1, 0.1), color=target_col)
        
        if step >= 2:
            plot.highlight_arc(B, C, A, color=BLUE_ANGLE, radius=0.6)
            plot.highlight_arc(C, A, B, color=BLUE_ANGLE, radius=0.6)
            plot.add_angle_text(C, A, B, "60°", radius=0.8, offset=(-0.1, 0.1), color=BLUE_ANGLE)

    for i in range(4):
        p = GeometryPlotter(f"prob_05_step{i}.png"); draw(p, i); p.save()

if __name__ == "__main__":
    # 1. 二等辺三角形の性質 (5ステップ)
    run_isosceles_properties_step_by_step()
    
    # 2. Mixed Problem
    run_mixed_problem()
    
    # 3. Problems 1-5 (4ステップずつ)
    print("Generating assets for Problems 1-5...")
    run_prob_01()
    run_prob_02()
    run_prob_03()
    run_prob_04()
    run_prob_05()
    
    print(f"All assets generated in '{OUTPUT_DIR}'")