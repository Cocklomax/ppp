import ppp from '../../ppp.js';
import { css, html } from '../../vendor/fast-element.min.js';
import { Page, pageStyles } from '../page.js';
import { formatDate } from '../../lib/intl.js';
import '../badge.js';
import '../button.js';
import '../table.js';

await ppp.i18n(import.meta.url);

export const apisPageTemplate = html`
  <template class="${(x) => x.generateClasses()}">
    <ppp-loader></ppp-loader>
    <form novalidate>
      <ppp-page-header>
        Список внешних API
        <ppp-button
          appearance="primary"
          slot="controls"
          @click="${() =>
            ppp.app.navigate({
              page: 'api'
            })}"
        >
          Подключить API
        </ppp-button>
      </ppp-page-header>
      <ppp-table
        @cleanup="${(x, c) =>
          x.cleanupFromListing({
            pageName: `api-${c.event.detail.datum.type}`,
            documentId: c.event.detail.datum._id
          })}"
        :columns="${() => [
          {
            label: 'Название'
          },
          {
            label: 'Тип'
          },
          {
            label: 'Дата создания'
          },
          {
            label: 'Последнее изменение'
          },
          {
            label: 'Версия'
          },
          {
            label: 'Действия'
          }
        ]}"
        :rows="${(x) =>
          x.documents.map((datum) => {
            return {
              datum,
              cells: [
                html`<a
                  class="link"
                  @click="${() => {
                    ppp.app.navigate({
                      page: `api-${datum.type}`,
                      document: datum._id
                    });

                    return false;
                  }}"
                  href="?page=api-${datum.type}&document=${datum._id}"
                >
                  ${datum.name}
                </a>`,
                ppp.t(`$const.api.${datum.type}`),
                formatDate(datum.createdAt),
                formatDate(datum.updatedAt ?? datum.createdAt),
                html`
                  <ppp-badge appearance="green">
                    ${() => datum.version}
                  </ppp-badge>
                `,
                html`
                  <ppp-button
                    action="cleanup"
                    :datum="${() => datum}"
                    class="xsmall"
                  >
                    Удалить
                  </ppp-button>
                `
              ]
            };
          })}"
      >
      </ppp-table>
    </form>
  </template>
`;

export const apisPageStyles = css`
  ${pageStyles}
`;

export class ApisPage extends Page {
  collection = 'apis';

  async populate() {
    return (context) => {
      return context.services
        .get('mongodb-atlas')
        .db('ppp')
        .collection('[%#this.collection%]')
        .find({
          removed: { $ne: true }
        })
        .sort({ updatedAt: -1 });
    };
  }
}

export default ApisPage.compose({
  template: apisPageTemplate,
  styles: apisPageStyles
}).define();
