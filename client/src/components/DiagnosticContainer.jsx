import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useBlockstack } from 'react-blockstack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import HealthLogToggle from './HealthLogToggle';
import Subscribe from './Subscribe';
import SymptomsTracker from './SymptomsTracker';
import actions from '../redux/actions/actions';
import Chart from './Chart';
import chartType from '../utils/chartType';

const useStyles = makeStyles({
  hr: {
    width: '100px',
    border: '1px black solid',
  },
});
const dateOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// check if the survey has been submitted today
const hasSubmitted = () => {
  const date = window.localStorage.getItem('date');
  const todaysDate = new Date().toISOString().slice(0, 10);
  if (date === todaysDate) {
    if (window.localStorage.getItem('surveyCompleted') === 'false') {
      return false;
    }
    return true;
  }
  window.localStorage.setItem('date', todaysDate);
  window.localStorage.setItem('surveyCompleted', 'false');
  return false;
};

function DiagnosticContainer(props) {
  const { setNumObservations } = props;
  const classes = useStyles();
  const { userSession } = useBlockstack();
  const today = new Date();
  const { t } = useTranslation();
  const files = [];
  let numObservations = 0;
  const fetchFiles = async () => {
    for (let i = 0; i < files.length; i += 1) {
      if (files[i].includes('observation/')) {
        const currObservation = parseInt(files[i].replace(/^\D+/g, ''), 10);
        numObservations = currObservation;
      }
    }
    setNumObservations(numObservations);
  };

  const fetchData = async () => {
    await userSession.listFiles(file => {
      files.push(file);
      return true;
    });
    return files;
  };

  useEffect(() => {
    fetchData().then(() => {
      fetchFiles();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numObservations]);

  return hasSubmitted() ? (
    <div>
      <h4>
        {t('hello')} <b>{userSession.loadUserData().profile.name}</b>
      </h4>
      <h5>
        {t('todayText')} <b>{today.toLocaleDateString(undefined, dateOptions)}</b>{' '}
      </h5>
      <hr className={classes.hr} />
      <HealthLogToggle />
      <Chart chartType={chartType.bar} />
      <Subscribe />
    </div>
  ) : (
    <SymptomsTracker />
  );
}

DiagnosticContainer.propTypes = {
  setNumObservations: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  return {
    numObservations: state.observationsReducer.numObservations,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setNumObservations: numObservations => dispatch(actions.setNumObservations(numObservations)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DiagnosticContainer);
