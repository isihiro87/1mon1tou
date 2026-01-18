import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# 共通設定
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['mathtext.fontset'] = 'stix'
fs = 24  # フォントサイズ

# 出力ディレクトリ
OUTPUT_DIR = 'explanation_images'
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_parallelogram_coords(b, d, angle_deg):
    """平行四辺形の4頂点と中心を計算"""
    theta = np.radians(angle_deg)
    B = np.array([0, 0])
    C = np.array([b, 0])
    A = np.array([d * np.cos(theta), d * np.sin(theta)])
    D = A + C
    Center = (A + C) / 2
    return A, B, C, D, Center

def draw_outer_arc(ax, p1, p2, center_of_shape, text, text_offset=0.2, color='gray', lw=1, fontsize=None):
    """2点間を結ぶ点線の円弧を描く"""
    if fontsize is None:
        fontsize = fs
    mid = (p1 + p2) / 2
    vec = p2 - p1
    normal = np.array([-vec[1], vec[0]])
    normal = normal / np.linalg.norm(normal)
    to_mid = mid - center_of_shape
    to_mid_norm = to_mid / np.linalg.norm(to_mid)
    dot_product = np.dot(normal, to_mid_norm)
    curvature = -0.3 if dot_product > 0 else 0.3
    
    arrow = patches.FancyArrowPatch(
        posA=p1, posB=p2,
        arrowstyle='-',
        connectionstyle=f"arc3,rad={curvature}",
        mutation_scale=10,
        linestyle='--',
        color=color,
        lw=lw
    )
    ax.add_patch(arrow)
    
    outer_direction = normal if dot_product > 0 else -normal
    txt_pos = mid + outer_direction * (np.linalg.norm(vec) * 0.2 + text_offset)
    ax.text(txt_pos[0], txt_pos[1], text, ha='center', va='center', fontsize=fontsize,
            bbox=dict(facecolor='white', edgecolor='none', pad=2), color=color)

def draw_inner_angle(ax, center, p1, p2, label, radius=0.7, color='k', lw=1, label_color='k', fontsize=None):
    """角度の円弧を描く"""
    if fontsize is None:
        fontsize = fs
    v1 = p1 - center
    v2 = p2 - center
    ang1 = np.degrees(np.arctan2(v1[1], v1[0]))
    ang2 = np.degrees(np.arctan2(v2[1], v2[0]))
    
    if ang2 < ang1:
        ang2 += 360
        
    arc = patches.Arc(center, radius*2, radius*2, angle=0, 
                      theta1=ang1, theta2=ang2, color=color, lw=lw)
    ax.add_patch(arc)
    
    mid_ang = np.radians((ang1 + ang2) / 2)
    lab_rad = radius + 0.4
    lab_x = center[0] + lab_rad * np.cos(mid_ang)
    lab_y = center[1] + lab_rad * np.sin(mid_ang)
    ax.text(lab_x, lab_y, label, fontsize=fontsize, ha='center', va='center', color=label_color)

def draw_diagonal_arc(ax, p1, p2, label, curve_dir='up', color='gray', lw=1, offset_mult=1.0, along_offset=0.0):
    """
    対角線の寸法線（円弧）を描く
    offset_mult: ラベルの距離の倍率（デフォルト1.0）
    along_offset: ベクトル方向に沿ったオフセット（デフォルト0.0）
    """
    vec = p2 - p1
    if curve_dir == 'left_up':
        rad = 0.3 
    else: # right_down
        rad = -0.3

    arrow = patches.FancyArrowPatch(
        posA=p1, posB=p2,
        arrowstyle='-',
        connectionstyle=f"arc3,rad={rad}",
        linestyle='--',
        color=color,
        lw=lw
    )
    ax.add_patch(arrow)
    
    if label:
        mid = (p1 + p2) / 2
        normal = np.array([-vec[1], vec[0]])
        normal /= np.linalg.norm(normal)
        
        # ベクトル方向の単位ベクトル（左右方向）
        vec_unit = vec / np.linalg.norm(vec)
        
        sign = -1 if rad > 0 else 1
        # 高さ方向（法線方向）とベクトル方向（左右方向）を分離
        # 高さ方向: normal * sign * 0.8 * offset_mult（上下方向）
        # 左右方向: vec_unit * along_offset（ベクトル方向に沿った左右方向）
        txt_pos = mid + normal * sign * 0.8 * offset_mult + vec_unit * along_offset
        ax.text(txt_pos[0], txt_pos[1], label, ha='center', va='center', fontsize=fs,
                bbox=dict(facecolor='white', edgecolor='none', pad=2), color=color)

# ==========================================
# Figure 1 Generation
# ==========================================
def generate_figure_1_variations():
    b, d, angle = 6, 4.5, 60
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    variations = [
        ("figure_1_0_base.png", []),
        ("figure_1_1_highlight_AB_CD.png", ['AB', 'CD']),
        ("figure_1_2_highlight_BC_DA.png", ['BC', 'DA']),
    ]

    for filename, highlights in variations:
        fig, ax = plt.subplots(figsize=(6, 5))
        
        # Base shape
        coords = np.array([B, C, D, A, B])
        ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
        
        # Highlight sides
        if 'AB' in highlights: ax.plot([A[0], B[0]], [A[1], B[1]], 'r-', lw=4)
        if 'BC' in highlights: ax.plot([B[0], C[0]], [B[1], C[1]], 'b-', lw=4)
        if 'CD' in highlights: ax.plot([C[0], D[0]], [C[1], D[1]], 'r-', lw=4)
        if 'DA' in highlights: ax.plot([D[0], A[0]], [D[1], A[1]], 'b-', lw=4)

        # Labels（大きめのフォントサイズ）
        fs_large = fs + 4  # 28
        off = 0.4
        ax.text(A[0]-off, A[1], 'A', fontsize=fs_large)
        ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs_large)
        ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs_large)
        ax.text(D[0]+off, D[1], 'D', fontsize=fs_large)
        
        # Arcs
        c_AB = 'red' if 'AB' in highlights else 'gray'
        c_BC = 'blue' if 'BC' in highlights else 'gray'
        c_CD = 'red' if 'CD' in highlights else 'gray'
        c_DA = 'blue' if 'DA' in highlights else 'gray'
        
        draw_outer_arc(ax, A, B, Center, r'$x$ cm', color=c_AB, lw=2 if 'AB' in highlights else 1, fontsize=fs_large)
        draw_outer_arc(ax, B, C, Center, r'$6$ cm', color=c_BC, lw=2 if 'BC' in highlights else 1, fontsize=fs_large)
        draw_outer_arc(ax, C, D, Center, r'$4.5$ cm', color=c_CD, lw=2 if 'CD' in highlights else 1, fontsize=fs_large)
        draw_outer_arc(ax, D, A, Center, r'$y$ cm', color=c_DA, lw=2 if 'DA' in highlights else 1, fontsize=fs_large)
        
        ax.axis('equal')
        ax.axis('off')
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, filename))
        plt.close()

# ==========================================
# Figure 2 Generation
# ==========================================
def generate_figure_2_variations():
    b, d, angle = 5, 4, 80
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    variations = [
        ("figure_2_0_base.png", []),
        ("figure_2_1_highlight_A_C.png", ['A', 'C']),
        ("figure_2_2_highlight_A_B.png", ['A', 'B']),
    ]

    for filename, highlights in variations:
        fig, ax = plt.subplots(figsize=(6, 5))
        
        coords = np.array([B, C, D, A, B])
        ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
        
        # Labels（大きめのフォントサイズ）
        fs_large = fs + 4  # 28
        off = 0.3
        ax.text(A[0]-off, A[1], 'A', fontsize=fs_large)
        ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs_large)
        ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs_large)
        ax.text(D[0]+off, D[1], 'D', fontsize=fs_large)
        
        # Angles
        # A & C (Opposite) -> Red
        # A & B (Adjacent) -> Blue
        
        col_A = 'gray'
        col_B = 'gray'
        col_C = 'gray'
        label_col_A = 'gray'
        label_col_B = 'gray'
        label_col_C = 'gray'
        
        if 'A' in highlights and 'C' in highlights:
            col_A = 'red'
            col_C = 'red'
            label_col_A = 'red'
            label_col_C = 'red'
        elif 'A' in highlights and 'B' in highlights:
            col_A = 'blue'
            col_B = 'blue'
            label_col_A = 'blue'
            label_col_B = 'blue'

        draw_inner_angle(ax, A, B, D, r'$100^\circ$', color=col_A, lw=2 if col_A != 'gray' else 1, label_color=label_col_A, fontsize=fs_large)
        draw_inner_angle(ax, B, C, A, r'$y$', color=col_B, lw=2 if col_B != 'gray' else 1, label_color=label_col_B, fontsize=fs_large)
        draw_inner_angle(ax, C, D, B, r'$x$', color=col_C, lw=2 if col_C != 'gray' else 1, label_color=label_col_C, fontsize=fs_large)

        ax.axis('equal')
        ax.axis('off')
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, filename))
        plt.close()

# ==========================================
# Figure 3 Generation
# ==========================================
def generate_figure_3_variations():
    b, d, angle = 7, 5, 70
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    variations = [
        ("figure_3_0_base.png", []),
        ("figure_3_1_highlight_AC.png", ['AC']),
        ("figure_3_2_highlight_BD.png", ['BD']),
        ("figure_3_3_highlight_halves_AC.png", ['half_AC']), # y and 5
        ("figure_3_4_highlight_halves_BD.png", ['half_BD']), # 4 and x
    ]

    for filename, highlights in variations:
        fig, ax = plt.subplots(figsize=(6, 5))
        
        # Base shape
        coords = np.array([B, C, D, A, B])
        ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
        
        # Diagonals base
        ax.plot([A[0], C[0]], [A[1], C[1]], 'k-', lw=1.5)
        ax.plot([B[0], D[0]], [B[1], D[1]], 'k-', lw=1.5)
        
        # Highlights
        if 'AC' in highlights:
            ax.plot([A[0], C[0]], [A[1], C[1]], 'r-', lw=4)
        if 'BD' in highlights:
            ax.plot([B[0], D[0]], [B[1], D[1]], 'b-', lw=4)
        if 'half_AC' in highlights:
            ax.plot([A[0], Center[0]], [A[1], Center[1]], 'r-', lw=4)
            ax.plot([Center[0], C[0]], [Center[1], C[1]], 'r-', lw=4)
        if 'half_BD' in highlights:
            ax.plot([B[0], Center[0]], [B[1], Center[1]], 'b-', lw=4)
            ax.plot([Center[0], D[0]], [Center[1], D[1]], 'b-', lw=4)

        off = 0.4
        ax.text(A[0]-off, A[1], 'A', fontsize=fs)
        ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs)
        ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs)
        ax.text(D[0]+off, D[1], 'D', fontsize=fs)
        
        # Arcs
        # AC related
        c_AC = 'red' if 'AC' in highlights or 'half_AC' in highlights else 'gray'
        lw_AC = 2 if 'AC' in highlights or 'half_AC' in highlights else 1
        
        draw_diagonal_arc(ax, A, Center, r'$x$ cm', curve_dir='left_up', color=c_AC, lw=lw_AC)
        draw_diagonal_arc(ax, A, C, r'$AC = 10$ cm', curve_dir='right_down', color=c_AC, lw=lw_AC, offset_mult=1.5, along_offset=-0.9)
        
        # BD related
        c_BD = 'blue' if 'BD' in highlights or 'half_BD' in highlights else 'gray'
        lw_BD = 2 if 'BD' in highlights or 'half_BD' in highlights else 1
        
        draw_diagonal_arc(ax, B, Center, r'$4$ cm', curve_dir='right_down', color=c_BD, lw=lw_BD)
        draw_diagonal_arc(ax, Center, D, r'$y$ cm', curve_dir='left_up', color=c_BD, lw=lw_BD)

        ax.axis('equal')
        ax.axis('off')
        plt.tight_layout()
        plt.savefig(os.path.join(OUTPUT_DIR, filename))
        plt.close()

# ==========================================
# 3つの図形を1つにまとめた画像
# ==========================================
def create_combined_figures():
    # 2行2列のレイアウト（上に2つ、下に1つ中央）
    fig = plt.figure(figsize=(12, 12))
    gs = fig.add_gridspec(2, 2, hspace=0.3, wspace=0.3)
    
    # Figure 1 (左上)
    b1, d1, angle1 = 6, 4.5, 60
    A1, B1, C1, D1, Center1 = get_parallelogram_coords(b1, d1, angle1)
    ax1 = fig.add_subplot(gs[0, 0])
    
    coords1 = np.array([B1, C1, D1, A1, B1])
    ax1.plot(coords1[:, 0], coords1[:, 1], 'k-', lw=2)
    
    fs_large = fs + 4  # 28
    off1 = 0.4
    ax1.text(A1[0]-off1, A1[1], 'A', fontsize=fs_large)
    ax1.text(B1[0]-off1, B1[1]-off1, 'B', fontsize=fs_large)
    ax1.text(C1[0]+off1, C1[1]-off1, 'C', fontsize=fs_large)
    ax1.text(D1[0]+off1, D1[1], 'D', fontsize=fs_large)
    
    draw_outer_arc(ax1, A1, B1, Center1, r'$x$ cm', fontsize=fs_large)
    draw_outer_arc(ax1, B1, C1, Center1, r'$6$ cm', fontsize=fs_large)
    draw_outer_arc(ax1, C1, D1, Center1, r'$4.5$ cm', fontsize=fs_large)
    draw_outer_arc(ax1, D1, A1, Center1, r'$y$ cm', fontsize=fs_large)
    
    ax1.axis('equal')
    ax1.axis('off')
    ax1.set_title('(1)', fontsize=fs+2, pad=10)
    
    # Figure 2 (右上)
    b2, d2, angle2 = 5, 4, 80
    A2, B2, C2, D2, Center2 = get_parallelogram_coords(b2, d2, angle2)
    ax2 = fig.add_subplot(gs[0, 1])
    
    coords2 = np.array([B2, C2, D2, A2, B2])
    ax2.plot(coords2[:, 0], coords2[:, 1], 'k-', lw=2)
    
    fs_large = fs + 4  # 28
    off2 = 0.3
    ax2.text(A2[0]-off2, A2[1], 'A', fontsize=fs_large)
    ax2.text(B2[0]-off2, B2[1]-off2, 'B', fontsize=fs_large)
    ax2.text(C2[0]+off2, C2[1]-off2, 'C', fontsize=fs_large)
    ax2.text(D2[0]+off2, D2[1], 'D', fontsize=fs_large)
    
    draw_inner_angle(ax2, A2, B2, D2, r'$100^\circ$', label_color='gray', fontsize=fs_large)
    draw_inner_angle(ax2, B2, C2, A2, r'$y$', label_color='gray', fontsize=fs_large)
    draw_inner_angle(ax2, C2, D2, B2, r'$x$', label_color='gray', fontsize=fs_large)
    
    ax2.axis('equal')
    ax2.axis('off')
    ax2.set_title('(2)', fontsize=fs+2, pad=10)
    
    # Figure 3 (下中央)
    b3, d3, angle3 = 7, 5, 70
    A3, B3, C3, D3, Center3 = get_parallelogram_coords(b3, d3, angle3)
    ax3 = fig.add_subplot(gs[1, :])
    
    coords3 = np.array([B3, C3, D3, A3, B3])
    ax3.plot(coords3[:, 0], coords3[:, 1], 'k-', lw=2)
    ax3.plot([A3[0], C3[0]], [A3[1], C3[1]], 'k-', lw=1.5)
    ax3.plot([B3[0], D3[0]], [B3[1], D3[1]], 'k-', lw=1.5)
    
    off3 = 0.4
    ax3.text(A3[0]-off3, A3[1], 'A', fontsize=fs)
    ax3.text(B3[0]-off3, B3[1]-off3, 'B', fontsize=fs)
    ax3.text(C3[0]+off3, C3[1]-off3, 'C', fontsize=fs)
    ax3.text(D3[0]+off3, D3[1], 'D', fontsize=fs)
    
    draw_diagonal_arc(ax3, A3, Center3, r'$x$ cm', curve_dir='left_up')
    draw_diagonal_arc(ax3, A3, C3, r'$AC = 10$ cm', curve_dir='right_down', offset_mult=1.5, along_offset=-0.9)
    draw_diagonal_arc(ax3, B3, Center3, r'$4$ cm', curve_dir='right_down')
    draw_diagonal_arc(ax3, Center3, D3, r'$y$ cm', curve_dir='left_up')
    
    ax3.axis('equal')
    ax3.axis('off')
    ax3.set_title('(3)', fontsize=fs+2, pad=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'figure_combined.png'), dpi=150, bbox_inches='tight')
    plt.close()

# ==========================================
# Figure 3: 対角線に色を付けたバージョン
# ==========================================
def create_figure_3_colored():
    b, d, angle = 7, 5, 70
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # Base shape
    coords = np.array([B, C, D, A, B])
    ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
    
    # 対角線に色を付ける（AC: 赤、BD: 青）
    ax.plot([A[0], C[0]], [A[1], C[1]], 'r-', lw=3) # AC
    ax.plot([B[0], D[0]], [B[1], D[1]], 'b-', lw=3) # BD
    
    off = 0.4
    ax.text(A[0]-off, A[1], 'A', fontsize=fs)
    ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs)
    ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs)
    ax.text(D[0]+off, D[1], 'D', fontsize=fs)
    
    # Arcs
    draw_diagonal_arc(ax, A, Center, r'$x$ cm', curve_dir='left_up')
    draw_diagonal_arc(ax, A, C, r'$AC = 10$ cm', curve_dir='right_down', offset_mult=1.5, along_offset=-0.9)
    draw_diagonal_arc(ax, B, Center, r'$4$ cm', curve_dir='right_down')
    draw_diagonal_arc(ax, Center, D, r'$y$ cm', curve_dir='left_up')
    
    ax.axis('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'figure_3_colored.png'))
    plt.close()

if __name__ == "__main__":
    generate_figure_1_variations()
    generate_figure_2_variations()
    generate_figure_3_variations()
    create_combined_figures()
    create_figure_3_colored()
    print(f"Images saved to {OUTPUT_DIR}")
