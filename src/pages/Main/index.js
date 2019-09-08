import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';
import Container from '../../components/Container';

export default class Main extends Component {
  state = {
    repositories: [],
    newRepo: '',
    loading: false,
    error: null,
  };

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');

    if (repositories) {
      this.setState({
        repositories: JSON.parse(repositories),
      });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;

    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();

    this.setState({ loading: true, error: false });

    const { newRepo, repositories } = this.state;

    try {
      this.validateRepository(newRepo);

      let response;
      try {
        response = await api.get(`/repos/${newRepo}`);
      } catch {
        throw new Error('Repositório não existe');
      }

      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
      });
    } catch (err) {
      alert(err);
      this.setState({
        error: true,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  checkIfRepositoryDuplicate(newRepoName) {
    const { repositories } = this.state;

    const repository = repositories.find(value => {
      return value.name === newRepoName;
    });

    if (repository) {
      throw new Error('Repositório duplicado');
    }
  }

  validateRepository(newRepoName) {
    if (!newRepoName) {
      throw new Error('Repositório não foi informado');
    }
    this.checkIfRepositoryDuplicate(newRepoName);
  }

  render() {
    const { newRepo, repositories, loading, error } = this.state;

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />
          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}
