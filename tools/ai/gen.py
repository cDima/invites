"""Generate a still with Imagen and animate it with Veo.
usage: python3 gen.py <outdir> <image_prompt_file> <video_prompt_file>
Auth: if GEMINI_API_KEY is set, uses the Gemini API; otherwise Vertex AI via gcloud."""
import base64, json, subprocess, sys, time, urllib.request, urllib.error, os
out, ip, vp = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
proj = subprocess.check_output(['gcloud','config','get-value','project'],text=True,stderr=subprocess.DEVNULL).strip()
LOC='us-central1'; BASE=f'https://{LOC}-aiplatform.googleapis.com/v1/projects/{proj}/locations/{LOC}/publishers/google/models'
def tok(): return subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
def post(url, body):
    req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+tok(),'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=300) as r: return json.load(r)
    except urllib.error.HTTPError as e: raise RuntimeError(f'{e.code} {e.read().decode()[:600]}')
KEY=os.environ.get('GEMINI_API_KEY')
if KEY:
    G='https://generativelanguage.googleapis.com/v1beta'
    def gpost(url,body):
        req=urllib.request.Request(url,data=json.dumps(body).encode(),headers={'x-goog-api-key':KEY,'Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(req,timeout=300) as r: return json.load(r)
        except urllib.error.HTTPError as e: raise RuntimeError(f'{e.code} {e.read().decode()[:600]}')
    def gget(url):
        req=urllib.request.Request(url,headers={'x-goog-api-key':KEY})
        with urllib.request.urlopen(req,timeout=300) as r: return r.read()
    ip_=os.path.join(out,'still.png')
    if not os.path.exists(ip_):
        for m in ['imagen-4.0-ultra-generate-001','imagen-4.0-generate-001']:
            try:
                r=gpost(f'{G}/models/{m}:predict',{'instances':[{'prompt':open(ip).read()}],'parameters':{'sampleCount':1,'aspectRatio':'9:16','personGeneration':'dont_allow'}})
                open(ip_,'wb').write(base64.b64decode(r['predictions'][0]['bytesBase64Encoded'])); print('image ok via',m,flush=True); break
            except Exception as e: print('image fail',m,str(e)[:300],flush=True)
        else: sys.exit(1)
    b64=base64.b64encode(open(ip_,'rb').read()).decode()
    for m in ['veo-3.1-generate-preview','veo-3.0-generate-001']:
        try:
            op=gpost(f'{G}/models/{m}:predictLongRunning',{'instances':[{'prompt':open(vp).read(),'image':{'bytesBase64Encoded':b64,'mimeType':'image/png'}}],'parameters':{'aspectRatio':'9:16','personGeneration':'allow_adult'}})
            print('video started via',m,flush=True)
            for i in range(90):
                time.sleep(10); st=json.loads(gget(f"{G}/{op['name']}"))
                if st.get('done'):
                    if 'error' in st: raise RuntimeError(json.dumps(st['error'])[:400])
                    uri=st['response']['generateVideoResponse']['generatedSamples'][0]['video']['uri']
                    open(os.path.join(out,'clip.mp4'),'wb').write(gget(uri)); print('video ok',flush=True); sys.exit(0)
            raise RuntimeError('timeout')
        except Exception as e: print('video fail',m,str(e)[:400],flush=True)
    sys.exit(2)
img_path=os.path.join(out,'still.png')
if not os.path.exists(img_path):
    for model in ['imagen-4.0-ultra-generate-001','imagen-4.0-generate-001','imagen-3.0-generate-002']:
        try:
            r=post(f'{BASE}/{model}:predict',{'instances':[{'prompt':open(ip).read()}],'parameters':{'sampleCount':1,'aspectRatio':'9:16','personGeneration':'dont_allow'}})
            open(img_path,'wb').write(base64.b64decode(r['predictions'][0]['bytesBase64Encoded'])); print('image ok via',model,flush=True); break
        except Exception as e: print('image fail',model,str(e)[:300],flush=True)
    else: sys.exit(1)
img64=base64.b64encode(open(img_path,'rb').read()).decode()
for model in ['veo-3.1-generate-001','veo-3.0-generate-001','veo-2.0-generate-001']:
    try:
        params={'aspectRatio':'9:16','durationSeconds':8,'sampleCount':1,'personGeneration':'dont_allow'}
        if not model.startswith('veo-2'): params['generateAudio']=False; params['resolution']='1080p'
        op=post(f'{BASE}/{model}:predictLongRunning',{'instances':[{'prompt':open(vp).read(),'image':{'bytesBase64Encoded':img64,'mimeType':'image/png'}}],'parameters':params})
        name=op['name']; print('video started via',model,flush=True)
        for i in range(90):
            time.sleep(10)
            st=post(f'{BASE}/{model}:fetchPredictOperation',{'operationName':name})
            if st.get('done'):
                if 'error' in st: raise RuntimeError(json.dumps(st['error'])[:400])
                vids=st['response'].get('videos') or []
                if not vids: raise RuntimeError('no video returned: '+json.dumps(st['response'])[:400])
                open(os.path.join(out,'clip.mp4'),'wb').write(base64.b64decode(vids[0]['bytesBase64Encoded'])); print('video ok',flush=True); sys.exit(0)
        raise RuntimeError('timeout')
    except Exception as e: print('video fail',model,str(e)[:400],flush=True)
sys.exit(2)
