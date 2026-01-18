import wave
import numpy as np
import os

# 設定
MIN_SILENCE_DURATION = 0.35  # 分割する無音区間の最小長さ（秒）。ここを調整してください。
SILENCE_THRESHOLD_RATIO = 0.01 # 無音とみなす閾値（最大音量に対する比率）

def split_audio(input_file, min_silence_duration=MIN_SILENCE_DURATION, silence_threshold_ratio=SILENCE_THRESHOLD_RATIO):
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    print(f"Loading {input_file}...")
    try:
        with wave.open(input_file, 'rb') as wf:
            params = wf.getparams()
            nchannels, sampwidth, framerate, nframes, comptype, compname = params
            raw_data = wf.readframes(nframes)
            
            # Convert to numpy array
            if sampwidth == 2:
                dtype = np.int16
                max_possible = 32768
            elif sampwidth == 4:
                dtype = np.int32
                max_possible = 2147483648
            elif sampwidth == 1:
                dtype = np.uint8
                max_possible = 256
            else:
                print(f"Unsupported sample width: {sampwidth}")
                return
                
            data = np.frombuffer(raw_data, dtype=dtype)
            
            # Reshape if stereo
            if nchannels > 1:
                data = data.reshape(-1, nchannels)
                # Convert to mono for silence detection (average)
                mono_data = np.mean(data, axis=1)
            else:
                mono_data = data
                
            if sampwidth == 1:
                mono_data = mono_data - 128 # Center around 0 for uint8

    except Exception as e:
        print(f"Error reading wav file with wave module: {e}")
        return

    # Normalize to 0-1 range for thresholding
    # Use max_possible for absolute thresholding relative to bit depth
    normalized_data = np.abs(mono_data) / max_possible
    
    # Threshold
    threshold = silence_threshold_ratio
    
    # Find silence
    is_silent = normalized_data < threshold
    
    # Find runs of silence
    is_silent_padded = np.concatenate(([False], is_silent, [False]))
    changes = np.diff(is_silent_padded.astype(int))
    
    starts = np.where(changes == 1)[0]
    ends = np.where(changes == -1)[0]
    
    # Filter by duration
    min_samples = int(min_silence_duration * framerate)
    silence_ranges = []
    
    for s, e in zip(starts, ends):
        if (e - s) >= min_samples:
            silence_ranges.append((s, e))
            
    print(f"Found {len(silence_ranges)} silence segments > {min_silence_duration}s.")
    
    # Calculate split points (middle of silence)
    output_chunks = []
    last_split = 0
    
    for s, e in silence_ranges:
        mid = (s + e) // 2
        
        # Extract chunk
        chunk = data[last_split:mid]
        
        if len(chunk) > 0:
            output_chunks.append(chunk)
            
        last_split = mid
        
    # Add the last chunk
    if last_split < len(data):
        output_chunks.append(data[last_split:])
    
    # Save
    count = 0
    for chunk in output_chunks:
        if len(chunk) == 0:
            continue
            
        count += 1
        output_filename = f"part{count:02d}.wav"
        print(f"Exporting {output_filename}...")
        
        try:
            with wave.open(output_filename, 'wb') as out_wf:
                out_wf.setnchannels(nchannels)
                out_wf.setsampwidth(sampwidth)
                out_wf.setframerate(framerate)
                out_wf.writeframes(chunk.tobytes())
        except Exception as e:
            print(f"Error writing {output_filename}: {e}")
        
    print("Done.")

if __name__ == "__main__":
    split_audio("original_voice.wav")
