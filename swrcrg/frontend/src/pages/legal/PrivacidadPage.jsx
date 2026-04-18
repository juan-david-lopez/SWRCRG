import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={s.section}>
    <h2 style={s.sectionTitle}>{title}</h2>
    {children}
  </div>
);

const PrivacidadPage = () => (
  <div style={s.page}>
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <div style={s.iconWrap}>
          <Shield size={28} strokeWidth={1.5} color="#2563eb" />
        </div>
        <div>
          <h1 style={s.title}>Política de Privacidad y Tratamiento de Datos Personales</h1>
          <p style={s.meta}>Última actualización: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })} · SWRCRG</p>
        </div>
      </div>

      <div style={s.notice}>
        Esta política da cumplimiento a la <strong>Ley 1581 de 2012</strong> (Protección de Datos Personales), el <strong>Decreto 1377 de 2013</strong> y demás normas concordantes expedidas por la Superintendencia de Industria y Comercio (SIC) de Colombia.
      </div>

      <Section title="1. Responsable del Tratamiento">
        <p style={s.p}>
          <strong>SWRCRG</strong> — Sistema de Reportes Ciudadanos de Residuos y Gestión — es el responsable del tratamiento de los datos personales recolectados a través de esta plataforma. Para ejercer sus derechos o formular consultas, puede contactarnos a través de los canales habilitados en la plataforma.
        </p>
      </Section>

      <Section title="2. Datos Personales que Recolectamos">
        <p style={s.p}>Recolectamos únicamente los datos necesarios para la prestación del servicio:</p>
        <ul style={s.list}>
          <li><strong>Datos de identificación:</strong> nombre, apellido y correo electrónico.</li>
          <li><strong>Datos de contacto:</strong> número de teléfono (opcional).</li>
          <li><strong>Datos de ubicación:</strong> coordenadas geográficas asociadas a los reportes ciudadanos que usted crea voluntariamente.</li>
          <li><strong>Datos de uso:</strong> reportes, comentarios, historial de actividad dentro de la plataforma.</li>
        </ul>
        <p style={s.p}>No recolectamos datos sensibles en los términos del artículo 5 de la Ley 1581 de 2012.</p>
      </Section>

      <Section title="3. Finalidades del Tratamiento">
        <p style={s.p}>Sus datos personales serán tratados para las siguientes finalidades:</p>
        <ul style={s.list}>
          <li>Gestionar su registro y autenticación en la plataforma.</li>
          <li>Permitir la creación, seguimiento y gestión de reportes ciudadanos.</li>
          <li>Enviar notificaciones relacionadas con el estado de sus reportes.</li>
          <li>Mejorar la funcionalidad y experiencia de la plataforma.</li>
          <li>Cumplir con obligaciones legales y requerimientos de autoridades competentes.</li>
          <li>Generar estadísticas agregadas y anonimizadas sobre el uso del servicio.</li>
        </ul>
      </Section>

      <Section title="4. Base Legal del Tratamiento">
        <p style={s.p}>
          El tratamiento de sus datos se fundamenta en el <strong>consentimiento libre, previo, expreso e informado</strong> que usted otorga al momento de registrarse en la plataforma, de conformidad con el artículo 9 de la Ley 1581 de 2012. Usted puede revocar su consentimiento en cualquier momento, sin efectos retroactivos.
        </p>
      </Section>

      <Section title="5. Derechos del Titular">
        <p style={s.p}>Como titular de datos personales, usted tiene los siguientes derechos reconocidos por la Ley 1581 de 2012:</p>
        <ul style={s.list}>
          <li><strong>Conocer</strong> los datos personales que tenemos sobre usted.</li>
          <li><strong>Actualizar y rectificar</strong> sus datos cuando sean inexactos o incompletos.</li>
          <li><strong>Solicitar prueba</strong> de la autorización otorgada para el tratamiento.</li>
          <li><strong>Ser informado</strong> sobre el uso que se ha dado a sus datos.</li>
          <li><strong>Presentar quejas</strong> ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
          <li><strong>Revocar</strong> la autorización y/o solicitar la supresión de sus datos, salvo que exista deber legal de conservarlos.</li>
          <li><strong>Acceder gratuitamente</strong> a sus datos personales que hayan sido objeto de tratamiento.</li>
        </ul>
        <p style={s.p}>Para ejercer estos derechos, puede actualizar su información directamente desde su perfil en la plataforma o contactarnos a través de los canales disponibles.</p>
      </Section>

      <Section title="6. Transferencia y Transmisión de Datos">
        <p style={s.p}>
          SWRCRG no vende, alquila ni comercializa sus datos personales a terceros. Los datos podrán ser compartidos únicamente con:
        </p>
        <ul style={s.list}>
          <li>Autoridades públicas competentes cuando sea requerido por ley o por orden judicial.</li>
          <li>Proveedores de servicios tecnológicos que actúen como encargados del tratamiento, bajo estrictas obligaciones de confidencialidad.</li>
        </ul>
        <p style={s.p}>Cualquier transferencia internacional de datos se realizará conforme al artículo 26 de la Ley 1581 de 2012 y las instrucciones de la SIC.</p>
      </Section>

      <Section title="7. Seguridad de los Datos">
        <p style={s.p}>
          Implementamos medidas técnicas, administrativas y físicas para proteger sus datos personales contra acceso no autorizado, pérdida, alteración o divulgación, en cumplimiento del principio de seguridad establecido en el artículo 4 de la Ley 1581 de 2012. Las contraseñas se almacenan con cifrado bcrypt y las comunicaciones se realizan mediante protocolos seguros.
        </p>
      </Section>

      <Section title="8. Conservación de los Datos">
        <p style={s.p}>
          Sus datos personales serán conservados durante el tiempo que mantenga una cuenta activa en la plataforma y por el período adicional que exijan las obligaciones legales aplicables. Una vez cumplida la finalidad del tratamiento y vencidos los plazos legales, los datos serán suprimidos de forma segura.
        </p>
      </Section>

      <Section title="9. Menores de Edad">
        <p style={s.p}>
          Esta plataforma no está dirigida a menores de 18 años. No recolectamos conscientemente datos de menores de edad. Si usted es padre, madre o tutor y tiene conocimiento de que un menor ha proporcionado datos personales, le pedimos que nos lo informe para proceder a su eliminación.
        </p>
      </Section>

      <Section title="10. Cambios a esta Política">
        <p style={s.p}>
          Nos reservamos el derecho de actualizar esta política en cualquier momento. Los cambios sustanciales serán notificados a través de la plataforma con al menos 10 días hábiles de anticipación, conforme a las buenas prácticas recomendadas por la SIC.
        </p>
      </Section>

      <Section title="11. Autoridad de Control">
        <p style={s.p}>
          La entidad encargada de velar por el cumplimiento de la normativa de protección de datos en Colombia es la <strong>Superintendencia de Industria y Comercio (SIC)</strong>, ante la cual puede presentar reclamaciones en caso de considerar vulnerados sus derechos.
        </p>
      </Section>

      <div style={s.footer}>
        <Link to="/terminos" style={s.footerLink}>Términos y Condiciones</Link>
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

export default PrivacidadPage;
