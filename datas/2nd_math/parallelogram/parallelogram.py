import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

# 共通設定
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['mathtext.fontset'] = 'stix'
fs = 24  # フォントサイズ

def get_parallelogram_coords(b, d, angle_deg):
    """平行四辺形の4頂点と中心を計算"""
    theta = np.radians(angle_deg)
    B = np.array([0, 0])
    C = np.array([b, 0])
    A = np.array([d * np.cos(theta), d * np.sin(theta)])
    D = A + C
    Center = (A + C) / 2
    return A, B, C, D, Center

def draw_outer_arc(ax, p1, p2, center_of_shape, text, text_offset=0.2, text_color='gray', fontsize=None):
    """
    2点間を結ぶ点線の円弧を描く。
    図形の中心(center_of_shape)から遠ざかる方向に膨らむように制御。
    fontsize: フォントサイズ（Noneの場合はグローバルのfsを使用）
    """
    if fontsize is None:
        fontsize = fs
    # 中点
    mid = (p1 + p2) / 2
    # 辺のベクトル
    vec = p2 - p1
    
    # 法線ベクトル（p1->p2に対して左側）
    normal = np.array([-vec[1], vec[0]])
    normal = normal / np.linalg.norm(normal)
    
    # 中心から中点へのベクトル
    to_mid = mid - center_of_shape
    to_mid_norm = to_mid / np.linalg.norm(to_mid)
    
    # 法線が中心から外側を向いているかチェック
    # 外側を向いていれば内積が正
    dot_product = np.dot(normal, to_mid_norm)
    
    # 外側に膨らむように曲率を設定
    # FancyArrowPatchのradパラメータは、正の値で左に、負の値で右に膨らむ
    # 法線が外側を向いている場合は負の曲率（右に膨らむ = 外側）
    # 法線が内側を向いている場合は正の曲率（左に膨らむ = 外側）
    curvature = -0.3 if dot_product > 0 else 0.3
    
    # 円弧の描画
    arrow = patches.FancyArrowPatch(
        posA=p1, posB=p2,
        arrowstyle='-',
        connectionstyle=f"arc3,rad={curvature}",
        mutation_scale=10,
        linestyle='--',
        color='gray',
        lw=1
    )
    ax.add_patch(arrow)
    
    # テキスト位置（中点から外側方向にずらす）
    # 外側方向のベクトルを使用
    outer_direction = normal if dot_product > 0 else -normal
    txt_pos = mid + outer_direction * (np.linalg.norm(vec) * 0.2 + text_offset)
    ax.text(txt_pos[0], txt_pos[1], text, ha='center', va='center', fontsize=fontsize,
            bbox=dict(facecolor='white', edgecolor='none', pad=2), color=text_color)

# ==========================================
# 図形 (1): 辺の長さ (外側に円弧)
# ==========================================
def create_figure_1():
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # 数値設定 (オリジナル: 底辺6, 斜辺4.5, 角度60度)
    b, d, angle = 6, 4.5, 60
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    # 平行四辺形
    coords = np.array([B, C, D, A, B])
    ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
    
    # 頂点ラベル（大きめのフォントサイズ）
    fs_large = fs + 4  # 28
    off = 0.4
    ax.text(A[0]-off, A[1], 'A', fontsize=fs_large)
    ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs_large)
    ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs_large)
    ax.text(D[0]+off, D[1], 'D', fontsize=fs_large)
    
    # 辺の円弧 (図形の外側になるように関数内で制御、大きめのフォントサイズ)
    draw_outer_arc(ax, A, B, Center, r'$x$ cm', fontsize=fs_large)      # 左
    draw_outer_arc(ax, B, C, Center, r'$6$ cm', fontsize=fs_large)      # 下
    draw_outer_arc(ax, C, D, Center, r'$4.5$ cm', fontsize=fs_large)    # 右
    draw_outer_arc(ax, D, A, Center, r'$y$ cm', fontsize=fs_large)      # 上
    
    ax.axis('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('figure_1.png')
    plt.close()

# ==========================================
# 図形 (2): 角度 (内側に円弧)
# ==========================================
def create_figure_2():
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # 数値設定 (平行四辺形: 80度)
    b, d, angle = 5, 4, 80
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    # 平行四辺形
    coords = np.array([B, C, D, A, B])
    ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
    
    # 頂点ラベル（大きめのフォントサイズ）
    fs_large = fs + 4  # 28
    off = 0.3
    ax.text(A[0]-off, A[1], 'A', fontsize=fs_large)
    ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs_large)
    ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs_large)
    ax.text(D[0]+off, D[1], 'D', fontsize=fs_large)
    
    # 角度の円弧を描く関数 (内側)
    def draw_inner_angle(center, p1, p2, label, radius=0.7, color='k', label_color='gray', fontsize=None):
        if fontsize is None:
            fontsize = fs
        # 角度計算
        v1 = p1 - center
        v2 = p2 - center
        ang1 = np.degrees(np.arctan2(v1[1], v1[0]))
        ang2 = np.degrees(np.arctan2(v2[1], v2[0]))
        
        if ang2 < ang1:
            ang2 += 360
            
        # Arc描画 (内側に円弧を描くため、半径を小さめに設定)
        arc = patches.Arc(center, radius*2, radius*2, angle=0, 
                          theta1=ang1, theta2=ang2, color=color)
        ax.add_patch(arc)
        
        # ラベル位置 (角度の二等分線上、円弧の外側)
        mid_ang = np.radians((ang1 + ang2) / 2)
        lab_rad = radius + 0.4  # 円弧の外側
        lab_x = center[0] + lab_rad * np.cos(mid_ang)
        lab_y = center[1] + lab_rad * np.sin(mid_ang)
        ax.text(lab_x, lab_y, label, fontsize=fontsize, ha='center', va='center', color=label_color)

    # A: 100度 (B->D の順で内側の角を指す)
    draw_inner_angle(A, B, D, r'$100^\circ$', label_color='gray', fontsize=fs_large)
    # B: y
    draw_inner_angle(B, C, A, r'$y$', label_color='gray', fontsize=fs_large)
    # C: x (対角)
    draw_inner_angle(C, D, B, r'$x$', label_color='gray', fontsize=fs_large)

    ax.axis('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('figure_2.png')
    plt.close()

# ==========================================
# 図形 (3): 対角線 (円弧の寸法線)
# ==========================================
def create_figure_3():
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # 数値設定
    b, d, angle = 7, 5, 70
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    # 平行四辺形と対角線
    coords = np.array([B, C, D, A, B])
    ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2) # 外枠
    ax.plot([A[0], C[0]], [A[1], C[1]], 'k-', lw=1.5) # AC
    ax.plot([B[0], D[0]], [B[1], D[1]], 'k-', lw=1.5) # BD
    
    # 頂点ラベル
    off = 0.4
    ax.text(A[0]-off, A[1], 'A', fontsize=fs)
    ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs)
    ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs)
    ax.text(D[0]+off, D[1], 'D', fontsize=fs)
    
    # 対角線の寸法線（円弧）を描く関数
    def draw_diagonal_arc(p1, p2, label, curve_dir='up', offset_mult=1.0, along_offset=0.0, text_color='gray'):
        """
        p1, p2: 線分の端点
        curve_dir: 膨らむ方向のヒント ('up' or 'down' like visual offset)
        offset_mult: ラベルの距離の倍率（デフォルト1.0）
        along_offset: ベクトル方向に沿ったオフセット（正の値で左方向、デフォルト0.0）
        text_color: テキストの色（デフォルト'gray'）
        """
        # ベクトル
        vec = p2 - p1
        # 回転行列で法線を作る
        if curve_dir == 'left_up':
            # ベクトルに対して左側に膨らませる
            rad = 0.3 
            offset_scale = 1
        else: # right_down
            # ベクトルに対して右側に膨らませる
            rad = -0.3
            offset_scale = -1

        # 寸法円弧
        arrow = patches.FancyArrowPatch(
            posA=p1, posB=p2,
            arrowstyle='-',
            connectionstyle=f"arc3,rad={rad}",
            linestyle='--',
            color='gray'
        )
        ax.add_patch(arrow)
        
        # ラベル位置計算
        mid = (p1 + p2) / 2
        normal = np.array([-vec[1], vec[0]])
        normal /= np.linalg.norm(normal)
        
        # ベクトル方向の単位ベクトル（左右方向）
        vec_unit = vec / np.linalg.norm(vec)
        
        # 方向補正
        # p1->p2ベクトルに対して左が正の法線。radが正なら左に膨らむ。
        # したがってラベルも左(normal方向)へ。
        # radが負なら右に膨らむ。ラベルは逆(normal * -1)へ。
        # ユーザー要望: 円弧とラベルを逆にする（直線を挟んで反対側）
        
        sign = -1 if rad > 0 else 1
        # 高さ方向（法線方向）とベクトル方向（左右方向）を分離
        # 高さ方向: normal * sign * 0.8 * offset_mult（上下方向）
        # 左右方向: vec_unit * along_offset（ベクトル方向に沿った左右方向）
        txt_pos = mid + normal * sign * 0.8 * offset_mult + vec_unit * along_offset
        
        ax.text(txt_pos[0], txt_pos[1], label, ha='center', va='center', fontsize=fs,
                bbox=dict(facecolor='white', edgecolor='none', pad=2), color=text_color)

    # 対角線 AC (A->Center, Center->C)
    # AからCenterへの線に対して、上側(左側)に膨らませる
    draw_diagonal_arc(A, Center, r'$x$ cm', curve_dir='left_up')
    # AC全体の長さを表示（上にずらすため offset_mult を大きく、左にずらすため along_offset を追加）
    draw_diagonal_arc(A, C, r'$AC = 10$ cm', curve_dir='right_down', offset_mult=1.5, along_offset=-0.9)
    
    # 対角線 BD (B->Center, Center->D)
    # BからCenterへの線に対して、下側(右側)に膨らませる
    draw_diagonal_arc(B, Center, r'$4$ cm', curve_dir='right_down')
    # CenterからDへの線に対して、上側(左側)に膨らませる
    draw_diagonal_arc(Center, D, r'$y$ cm', curve_dir='left_up')

    ax.axis('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('figure_3.png')
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
    
    def draw_inner_angle_combined(ax, center, p1, p2, label, radius=0.7, label_color='gray', fontsize=None):
        if fontsize is None:
            fontsize = fs
        v1 = p1 - center
        v2 = p2 - center
        ang1 = np.degrees(np.arctan2(v1[1], v1[0]))
        ang2 = np.degrees(np.arctan2(v2[1], v2[0]))
        if ang2 < ang1:
            ang2 += 360
        arc = patches.Arc(center, radius*2, radius*2, angle=0, 
                          theta1=ang1, theta2=ang2, color='k')
        ax.add_patch(arc)
        mid_ang = np.radians((ang1 + ang2) / 2)
        lab_rad = radius + 0.4
        lab_x = center[0] + lab_rad * np.cos(mid_ang)
        lab_y = center[1] + lab_rad * np.sin(mid_ang)
        ax.text(lab_x, lab_y, label, fontsize=fontsize, ha='center', va='center', color=label_color)
    
    draw_inner_angle_combined(ax2, A2, B2, D2, r'$100^\circ$', label_color='gray', fontsize=fs_large)
    draw_inner_angle_combined(ax2, B2, C2, A2, r'$y$', label_color='gray', fontsize=fs_large)
    draw_inner_angle_combined(ax2, C2, D2, B2, r'$x$', label_color='gray', fontsize=fs_large)
    
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
    
    def draw_diagonal_arc_combined(ax, p1, p2, label, curve_dir='up', offset_mult=1.0, along_offset=0.0, text_color='gray'):
        vec = p2 - p1
        if curve_dir == 'left_up':
            rad = 0.3 
        else:
            rad = -0.3
        arrow = patches.FancyArrowPatch(
            posA=p1, posB=p2,
            arrowstyle='-',
            connectionstyle=f"arc3,rad={rad}",
            linestyle='--',
            color='gray'
        )
        ax.add_patch(arrow)
        mid = (p1 + p2) / 2
        normal = np.array([-vec[1], vec[0]])
        normal /= np.linalg.norm(normal)
        vec_unit = vec / np.linalg.norm(vec)
        sign = -1 if rad > 0 else 1
        txt_pos = mid + normal * sign * 0.8 * offset_mult + vec_unit * along_offset
        ax.text(txt_pos[0], txt_pos[1], label, ha='center', va='center', fontsize=fs,
                bbox=dict(facecolor='white', edgecolor='none', pad=2), color=text_color)
    
    draw_diagonal_arc_combined(ax3, A3, Center3, r'$x$ cm', curve_dir='left_up')
    draw_diagonal_arc_combined(ax3, A3, C3, r'$AC = 10$ cm', curve_dir='right_down', offset_mult=1.5, along_offset=-0.9)
    draw_diagonal_arc_combined(ax3, B3, Center3, r'$4$ cm', curve_dir='right_down')
    draw_diagonal_arc_combined(ax3, Center3, D3, r'$y$ cm', curve_dir='left_up')
    
    ax3.axis('equal')
    ax3.axis('off')
    ax3.set_title('(3)', fontsize=fs+2, pad=10)
    
    plt.tight_layout()
    plt.savefig('figure_combined.png', dpi=150, bbox_inches='tight')
    plt.close()

# ==========================================
# Figure 3: 対角線に色を付けたバージョン
# ==========================================
def create_figure_3_colored():
    fig, ax = plt.subplots(figsize=(6, 5))
    
    # 数値設定
    b, d, angle = 7, 5, 70
    A, B, C, D, Center = get_parallelogram_coords(b, d, angle)
    
    # 平行四辺形
    coords = np.array([B, C, D, A, B])
    ax.plot(coords[:, 0], coords[:, 1], 'k-', lw=2)
    
    # 対角線に色を付ける（AC: 赤、BD: 青）
    ax.plot([A[0], C[0]], [A[1], C[1]], 'r-', lw=3) # AC
    ax.plot([B[0], D[0]], [B[1], D[1]], 'b-', lw=3) # BD
    
    # 頂点ラベル
    off = 0.4
    ax.text(A[0]-off, A[1], 'A', fontsize=fs)
    ax.text(B[0]-off, B[1]-off, 'B', fontsize=fs)
    ax.text(C[0]+off, C[1]-off, 'C', fontsize=fs)
    ax.text(D[0]+off, D[1], 'D', fontsize=fs)
    
    # 対角線の寸法線（円弧）を描く関数
    def draw_diagonal_arc(p1, p2, label, curve_dir='up', offset_mult=1.0, along_offset=0.0, text_color='gray'):
        vec = p2 - p1
        if curve_dir == 'left_up':
            rad = 0.3 
        else:
            rad = -0.3
        arrow = patches.FancyArrowPatch(
            posA=p1, posB=p2,
            arrowstyle='-',
            connectionstyle=f"arc3,rad={rad}",
            linestyle='--',
            color='gray'
        )
        ax.add_patch(arrow)
        mid = (p1 + p2) / 2
        normal = np.array([-vec[1], vec[0]])
        normal /= np.linalg.norm(normal)
        vec_unit = vec / np.linalg.norm(vec)
        sign = -1 if rad > 0 else 1
        txt_pos = mid + normal * sign * 0.8 * offset_mult + vec_unit * along_offset
        ax.text(txt_pos[0], txt_pos[1], label, ha='center', va='center', fontsize=fs,
                bbox=dict(facecolor='white', edgecolor='none', pad=2), color=text_color)
    
    # 対角線 AC (赤色)
    draw_diagonal_arc(A, Center, r'$x$ cm', curve_dir='left_up')
    draw_diagonal_arc(A, C, r'$AC = 10$ cm', curve_dir='right_down', offset_mult=1.5, along_offset=-0.9)
    
    # 対角線 BD (青色)
    draw_diagonal_arc(B, Center, r'$4$ cm', curve_dir='right_down')
    draw_diagonal_arc(Center, D, r'$y$ cm', curve_dir='left_up')
    
    ax.axis('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('figure_3_colored.png')
    plt.close()

if __name__ == "__main__":
    create_figure_1()
    create_figure_2()
    create_figure_3()
    create_combined_figures()
    create_figure_3_colored()
    print("修正された画像 figure_1.png, figure_2.png, figure_3.png, figure_combined.png, figure_3_colored.png を保存しました。")