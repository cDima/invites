#!/bin/zsh
# Turn an AI video (e.g. a Veo clip) into the frame sequence an invite plays while she rubs.
# usage: tools/ai/frames.sh <clip.mp4> <invite-folder> [frames=96] [width=720] [crop=W:H:X:Y]
# Writes <invite>/assets/frames/f_001.webp … and manifest.json. The page uses them automatically.
set -e
clip=$1; dir=$2; n=${3:-96}; w=${4:-720}; crop=${5:-}
FF=$(cd "$(dirname $0)/.." && .venv/bin/python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())")
out=$dir/assets/frames; rm -rf $out; mkdir -p $out
dur=$($FF -i $clip 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')
fps=$(echo "$n / $dur" | bc -l)
vf="fps=$fps"; [ -n "$crop" ] && vf="$vf,crop=$crop"; vf="$vf,scale=$w:-2"
$FF -v error -i $clip -vf $vf -frames:v $n -c:v libwebp -quality 72 $out/f_%03d.webp
count=$(ls $out | wc -l | tr -d ' ')
size=$($FF -i $out/f_001.webp 2>&1 | grep -o '[0-9]\{2,4\}x[0-9]\{2,4\}' | head -1)
echo "{\"count\":$count,\"w\":${size%x*},\"h\":${size#*x},\"pattern\":\"f_%03d.webp\"}" > $out/manifest.json
du -sh $out; cat $out/manifest.json
