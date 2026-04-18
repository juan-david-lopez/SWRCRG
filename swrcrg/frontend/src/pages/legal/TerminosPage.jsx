import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const TerminosPage = () => (
  <div style={s.page}>
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.iconWrap}>
          <FileText size={28} strokeWidth={1.5} color="#2563eb" />
        </div>
        <div>
          <h1 style={s.title}>Términos y Condiciones de Uso</h1>
          <p style={s.meta}>Última actualización: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} · SWRCRG</p>
        </div>
      </div>

      <div style={s.notice}>
        Al registrarse o utilizar la plataforma SWRCRG, usted acepta los presentes términos y condiciones. Estos se rigen por las leyes de la República de Colombia, en particular la <strong>Ley 527 de 1999</strong> (comercio electrónico), la <strong>Ley 1480 de 2011</strong> (Estatuto del Consumidor) y el <strong>Código Civil colombiano</strong>.
      </div>

      <Section title="1. Objeto y Naturaleza del Servicio">
        <p style={s.p}>
          SWRCRG es una plataforma digital de participación ciudadana que permite a los usuarios reportar problemas relacionados con residuos, infraestructura y servicios urbanos, facilitando la comunicación entre ciudadanos y las autoridades competentes. El servicio se presta de forma gratuita y su uso implica la aceptación plena de estos términos.
        </p>
      </Section>

      <Section title="2. Capacidad Legal">
        <p style={s.p}>
          Para utilizar la plataforma, el usuario debe ser mayor de 18 años y tener plena capacidad legal para contratar conforme al artículo 1502 del Código Civil colombiano. Al registrarse, el usuario declara bajo su responsabilidad que cumple con este requisito.
        </p>
      </Section>

      <Section title="3. Registro y Cuenta de Usuario">
        <ul style={s.list}>
          <li>El usuario se compromete a proporcionar información veraz, completa y actualizada al momento del registro.</li>
          <li>Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
          <li>Cualquier actividad realizada desde una cuenta es responsabilidad exclusiva del titular de la misma.</li>
          <li>SWRCRG se reserva el derecho de suspender o eliminar cuentas que incumplan estos términos, sin previo aviso y sin lugar a indemnización.</li>
          <li>El usuario puede solicitar la eliminación de su cuenta en cualquier momento, lo que implicará la supresión de sus datos personales conforme a la Ley 1581 de 2012.</li>
        </ul>
      </Section>

      <Section title="4. Uso Aceptable de la Plataforma">
        <p style={s.p}>El usuario se compromete a utilizar la plataforma de manera responsable y se abstiene de:</p>
        <ul style={s.list}>
          <li>Publicar reportes falsos, engañosos o con información fabricada.</li>
          <li>Subir contenido que vulnere derechos de terceros, sea difamatorio, obsceno, discriminatorio o ilegal.</li>
          <li>Utilizar la plataforma para fines distintos a la gestión ciudadana de residuos y servicios urbanos.</li>
          <li>Intentar acceder sin autorización a sistemas, cuentas o datos de otros usuarios.</li>
          <li>Realizar actividades que puedan dañar, sobrecargar o deteriorar el funcionamiento de la plataforma.</li>
          <li>Suplantar la identidad de otras personas o entidades.</li>
        </ul>
        <p style={s.p}>
          El incumplimiento de estas obligaciones podrá dar lugar a la suspensión inmediata de la cuenta y, en casos graves, a las acciones legales correspondientes conforme al ordenamiento jurídico colombiano.
        </p>
      </Section>

      <Section title="5. Contenido Generado por el Usuario">
        <p style={s.p}>
          Al publicar un reporte, imagen o comentario, el usuario otorga a SWRCRG una licencia no exclusiva, gratuita y transferible para usar, reproducir y mostrar dicho contenido dentro de la plataforma con fines operativos y estadísticos. El usuario declara ser el titular o tener los derechos necesarios sobre el contenido que publica.
        </p>
        <p style={s.p}>
          SWRCRG no se hace responsable por el contenido publicado por los usuarios. Sin embargo, se reserva el derecho de retirar cualquier contenido que viole estos términos o la legislación colombiana vigente.
        </p>
      </Section>

      <Section title="6. Propiedad Intelectual">
        <p style={s.p}>
          Todos los elementos de la plataforma (diseño, código fuente, logotipos, textos propios) son propiedad de SWRCRG y están protegidos por la <strong>Ley 23 de 1982</strong> sobre derechos de autor y la <strong>Decisión Andina 351 de 1993</strong>. Queda prohibida su reproducción, distribución o modificación sin autorización expresa y escrita.
        </p>
      </Section>

      <Section title="7. Limitación de Responsabilidad">
        <p style={s.p}>SWRCRG no garantiza:</p>
        <ul style={s.list}>
          <li>Que la plataforma esté disponible de forma ininterrumpida o libre de errores.</li>
          <li>Que los reportes ciudadanos sean atendidos por las autoridades competentes en un plazo determinado.</li>
          <li>La exactitud o veracidad del contenido publicado por los usuarios.</li>
        </ul>
        <p style={s.p}>
          En ningún caso SWRCRG será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de la plataforma, en los términos permitidos por la legislación colombiana.
        </p>
      </Section>

      <Section title="8. Disponibilidad del Servicio">
        <p style={s.p}>
          SWRCRG podrá suspender, modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso, por razones técnicas, de mantenimiento o de cualquier otra índole. No se reconocerá indemnización alguna por interrupciones del servicio.
        </p>
      </Section>

      <Section title="9. Modificaciones a los Términos">
        <p style={s.p}>
          SWRCRG se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor a partir de su publicación en la plataforma. El uso continuado del servicio después de la publicación de cambios constituye la aceptación de los nuevos términos.
        </p>
      </Section>

      <Section title="10. Ley Aplicable y Jurisdicción">
        <p style={s.p}>
          Estos términos se rigen por las leyes de la República de Colombia. Para la resolución de cualquier controversia derivada del uso de la plataforma, las partes se someten a la jurisdicción de los jueces y tribunales competentes de Colombia, renunciando a cualquier otro fuero que pudiera corresponderles.
        </p>
        <p style={s.p}>
          Antes de acudir a instancias judiciales, las partes procurarán resolver las diferencias mediante mecanismos alternativos de solución de conflictos, conforme a la <strong>Ley 446 de 1998</strong>.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p style={s.p}>
          Para cualquier consulta relacionada con estos términos, puede comunicarse con nosotros a través de los canales habilitados en la plataforma. Atenderemos su solicitud en un plazo máximo de 15 días hábiles, conforme a lo establecido en la Ley 1480 de 2011.
        </p>
      </Section>

      <div style={s.footer}>
        <Link to="/privacidad" style={s.footerLink}>Política de Privacidad</Link>
        <span style={s.dot}>·</span>
        <Link to="/cookies" style={s.footerLink}>Política de Cookies</Link>
        <span style={s.dot}>·</span>
        <Link to="/" style={s.footerLink}>Volver al inicio</Link>
      </div>

    </div>
  </div>
);

const s = {
  page:         { minHeight: '100vh', background: 'var(--c-bg)', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" },
  container:    { maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' },
  header:       { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' },
  iconWrap:     { width: '52px', height: '52px', borderRadius: '12px', background: 'var(--c-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' },
  title:        { fontSize: '26px', fontWeight: '800', color: 'var(--c-text)', margin: '0 0 6px', lineHeight: '1.2' },
  meta:         { fontSize: '13px', color: 'var(--c-text-3)', margin: 0 },
  notice:       { background: 'var(--c-primary-bg)', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', fontSize: '14px', color: 'var(--c-text-2)', lineHeight: '1.6', marginBottom: '36px' },
  section:      { marginBottom: '32px' },
  sectionTitle: { fontSize: '17px', fontWeight: '700', color: 'var(--c-text)', margin: '0 0 12px', paddingBottom: '8px', borderBottom: '1px solid var(--c-border)' },
  p:            { fontSize: '15px', color: 'var(--c-text-2)', lineHeight: '1.75', margin: '0 0 10px' },
  list:         { paddingLeft: '20px', margin: '8px 0 10px', display: 'flex', flexDirection: 'column', gap: '6px' },
  footer:       { display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px', borderTop: '1px solid var(--c-border)', flexWrap: 'wrap' },
  footerLink:   { fontSize: '14px', color: '#2563eb', textDecoration: 'none', fontWeight: '600' },
  dot:          { color: 'var(--c-text-3)', fontSize: '14px' },
};

export default TerminosPage;
