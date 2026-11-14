import { Link, useParams } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { getDepartment } from '../api/departments.js';
import Loading from '../components/ui/Loading.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';

export default function ServiceDetail() {
  const { slug } = useParams();
  usePageTitle('Department');
  const { data, loading, error } = useFetch(() => getDepartment(slug), [slug]);
  if (loading) return <section className="section"><div className="container"><Loading /></div></section>;
  if (error) return <section className="section"><div className="container"><ErrorMessage message={error.message} /></div></section>;
  return <section className="section"><div className="container"><h1>{data.name}</h1><p className="lede">{data.description}</p><h2>Common conditions</h2><ul className="tick">{data.commonConditions.map((condition) => <li key={condition}>{condition}</li>)}</ul><h2>Doctors</h2><div className="doctor-grid">{data.doctors.map((doctor) => <article className="doctor" key={doctor._id}><h3>{doctor.name}</h3><p>{doctor.specialty}</p><Link className="btn btn-secondary" to={`/appointment?doctor=${doctor._id}`}>Book with {doctor.name}</Link></article>)}</div><Link className="btn btn-primary" to={`/appointment?department=${data.slug}`}>Book with this department</Link></div></section>;
}
