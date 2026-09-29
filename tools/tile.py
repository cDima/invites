import subprocess,sys
import imageio_ffmpeg; FF=imageio_ffmpeg.get_ffmpeg_exe()
out,files=sys.argv[1],sys.argv[2:]
args=[FF,'-v','error','-y']
for f in files: args+=['-i',f]
fc=''.join(f'[{i}]scale=250:-1[v{i}];' for i in range(len(files)))+''.join(f'[v{i}]' for i in range(len(files)))+f'hstack={len(files)}'
subprocess.run(args+['-filter_complex',fc,out],check=True)
