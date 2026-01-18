import os
import re
import glob

def parse_markdown_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    headers = []
    rows = []
    in_table = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        if line.startswith('|'):
            # Check if it's a separator line
            if '---' in line:
                continue
                
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            
            if not headers:
                headers = cells
                in_table = True
            else:
                # Check if this is a repeated header row
                if cells == headers:
                    continue
                    
                row = {}
                for i, cell in enumerate(cells):
                    if i < len(headers):
                        row[headers[i]] = cell
                rows.append(row)
        elif in_table:
            # End of table
            in_table = False
            # Reset headers if we encounter multiple tables (e.g. multiple patterns)
            # For now, we just aggregate all rows from all tables
            # headers = [] 

    return rows

def convert_html_to_jsx(text):
    if not text:
        return ""
    
    # Replace <br> with <br />
    text = text.replace('<br>', '<br />')
    
    # Replace <span style="color:red">...</span> with <span style={{ color: 'red' }}>...</span>
    # Handle simple color styles
    def color_replacer(match):
        style_content = match.group(1)
        content = match.group(2)
        
        # Extract color value
        color_match = re.search(r'color\s*:\s*([^;"]+)', style_content)
        if color_match:
            color_val = color_match.group(1).strip()
            # Map common colors if needed, or use as is
            if color_val == 'red':
                color_val = '#E91E63' # Pinkish red used in samples
            elif color_val == 'blue':
                color_val = '#2196F3'
            
            return f"<span style={{{{ color: '{color_val}' }}}}>{content}</span>"
        return match.group(0)

    text = re.sub(r'<span style="([^"]+)">([^<]+)</span>', color_replacer, text)
    
    # Escape single quotes in text if not already handled
    # text = text.replace("'", "\\'") 
    
    return text

def clean_text(text):
    # Remove scene markers
    text = re.sub(r'【シーン\d+】', '', text)
    # Remove [日] [英] tags
    text = text.replace('[日]', '').replace('[英]', '')
    # Remove leading/trailing breaks/spaces
    text = text.replace('<br>', '\n').replace('<br />', '\n')
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    return lines

def generate_tsx_content(rows, file_index, topic, audio_base_path):
    # audio_base_path is passed from main
    audio_base = f"{audio_base_path}{file_index}_"
    
    scenes = []
    last_text_lines = [] # Keep track of last text lines for "（維持）"
    
    for i, row in enumerate(rows):
        scene_id = f"scene{i+1}"
        duration = 60 # Default duration
        audio_src = f"staticFile(`${{AUDIO_BASE}}{i+1:03d}.wav`)"
        
        raw_slide_text = row.get('スライドテキスト', '')
        script = row.get('読み上げ原稿', '')
        direction = row.get('画像・演出指示', '')
        
        # Resolve "（維持）"
        # If text is exactly "（維持）", use last_text_lines
        # If text contains "（維持）", replace it? 
        # Usually it's "（維持）<br>Added Text" -> Last Text + Added Text
        # Or "Added Text<br>（維持）" -> Added Text + Last Text
        
        current_text_lines = []
        
        # Pre-process raw text to handle <br> and （維持）
        # We'll treat （維持） as a placeholder for the entire previous block
        
        if '（維持）' in raw_slide_text:
            # If it's mixed, it's tricky because last_text_lines is a list.
            # Let's join last lines with <br> to substitute
            last_text_joined = "<br>".join(last_text_lines)
            resolved_text = raw_slide_text.replace('（維持）', last_text_joined)
        else:
            resolved_text = raw_slide_text
            
        # Now clean and split
        current_text_lines = clean_text(resolved_text)
        
        # Update last_text_lines for next iteration
        # Only update if the current row actually has text (not empty)
        # If it became empty (e.g. just scene marker), maybe keep previous?
        # But "（維持）" logic implies explicit instruction. 
        # If resolved_text is empty, it means blank screen? 
        # Let's assume non-empty update.
        if current_text_lines:
            last_text_lines = current_text_lines
        
        # Determine Component and Props
        board_content = ""
        role = "explanation"
        
        # Heuristic to determine scene type
        if i == 0 and "問題" in script:
            role = "question"
            # Extract Japanese and English text for QuizBoard from resolved text
            # We expect 2 lines usually: Japanese and English
            jp_text = ""
            en_text = ""
            
            if len(current_text_lines) >= 2:
                jp_text = current_text_lines[0]
                en_text = current_text_lines[1]
            elif len(current_text_lines) == 1:
                jp_text = current_text_lines[0]
            
            en_text = en_text.replace("( )", "（　）")
            
            board_content = f'<QuizBoard step="question" japaneseText="{jp_text}" englishText="{en_text}" />'
            
        else:
            # EnglishLessonBoard
            sentences_code_list = []
            for line in current_text_lines:
                jsx_line = convert_html_to_jsx(line)
                sentences_code_list.append(f'<span>{jsx_line}</span>')
            
            sentences_content = ",\n                ".join(sentences_code_list)
            
            explanation_text = script.replace('"', '\\"')
            
            # Image src placeholder
            image_src = "staticFile('images/placeholder.png')"
            if "イラスト" in direction:
                image_src = "staticFile('images/illustration.png')"
            
            board_content = f'''<EnglishLessonBoard
            topic={{TOPIC}}
            sentences={{[
                {sentences_content}
            ]}}
            explanation="{explanation_text}"
            imageSrc={{{image_src}}}
        />'''

        scene_code = f'''    {{
        id: '{scene_id}',
        durationInFrames: {duration},
        audioSrc: {audio_src},
        boardContent: () => {board_content},
        overlayText: '',
        characterComment: '',
        role: '{role}',
    }},'''
        scenes.append(scene_code)

    scenes_str = "\n".join(scenes)
    
    tsx_content = f'''import {{ staticFile }} from 'remotion';
import {{ QuizBoard, EnglishLessonBoard }} from './components/english';
import {{ Scene }} from './data';

export type {{ Scene }};

const AUDIO_BASE = '{audio_base}';

const TOPIC = '{topic}';

export const englishLessonData: Scene[] = [
{scenes_str}
];
'''
    return tsx_content

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Convert slide_content.md to englishData.tsx')
    parser.add_argument('--base_dir', help='Base directory containing slide_content files')
    parser.add_argument('--input_file', help='Specific slide_content file to process')
    parser.add_argument('--topic', required=True, help='Topic string for the lesson')
    parser.add_argument('--output_dir', required=True, help='Output directory for .tsx files')
    parser.add_argument('--output_file', help='Specific output filename (e.g. EnglishLessonData.tsx)')
    parser.add_argument('--audio_base', default='audio/grade2/unit06/01/content', help='Base path for audio files')

    args = parser.parse_args()

    base_dir = args.base_dir
    input_file = args.input_file
    output_dir = args.output_dir
    output_file = args.output_file
    topic = args.topic
    audio_base = args.audio_base
    
    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    slide_files = []
    if input_file:
        slide_files = [input_file]
    elif base_dir:
        slide_files = glob.glob(os.path.join(base_dir, "slide_content*.md"))
    else:
        print("Error: Either --base_dir or --input_file must be provided.")
        return

    if not slide_files:
        print(f"No slide_content files found.")
        return

    for slide_file in slide_files:
        filename = os.path.basename(slide_file)
        # Extract number
        match = re.search(r'slide_content(\d+)\.md', filename)
        if not match:
            print(f"Warning: Could not extract number from {filename}")
            file_index = "0" # Default or error handling
        else:
            file_index = match.group(1)
        
        print(f"Processing {filename}...")
        rows = parse_markdown_table(slide_file)
        
        if not rows:
            print(f"Warning: No rows found in {filename}")
            continue
            
        # Pass topic and audio_base to generate function
        tsx_content = generate_tsx_content(rows, file_index, topic, audio_base)
        
        if output_file:
            output_filename = output_file
        else:
            output_filename = f"englishData{file_index}.tsx"
            
        output_path = os.path.join(output_dir, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(tsx_content)
            
        print(f"Generated {output_filename} at {os.path.abspath(output_path)}")

if __name__ == "__main__":
    main()
