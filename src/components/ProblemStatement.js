import { getText } from '../utils/utils';

export default function ProblemStatement({ constraints, success }) {

  return <div className='problem-text'>
    <p>Draw a triangle following the below conditions</p>
    <ul>
    { constraints.map((value, index) => {
      return <li className="list-item" key={value.name}>
        <span className={
          'question-number ' + (value.invalid ? 'invalid': '') + ( success ? ' valid': '' )} >{ index + 1 }</span>
        {getText(value)}</li>
    }) }
    </ul>
  </div>;
}