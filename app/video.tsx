// Vídeo da ação: arquivo local em public/ ou link do Drive. No PDF vira só o link.
export function Video({ src, titulo }: { src: string; titulo: string }) {
  const drive = src.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  const link = drive ? `https://drive.google.com/file/d/${drive[1]}/view` : src;
  return (
    <figure className="video">
      <div className="so-tela">
        {drive ? (
          <iframe src={`https://drive.google.com/file/d/${drive[1]}/preview`} title={titulo} allow="autoplay" allowFullScreen />
        ) : (
          <video src={src} controls preload="metadata" aria-label={titulo} />
        )}
      </div>
      <figcaption>
        Vídeo: <a href={link}>{titulo}</a>
      </figcaption>
    </figure>
  );
}
