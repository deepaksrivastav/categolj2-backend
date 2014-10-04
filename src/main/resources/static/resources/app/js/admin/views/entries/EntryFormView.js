define(function (require) {
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Markdown = require('pagedown');
    require('pagedown.editor');
    require('backbone.stickit');
    var $ = require('jquery');
    var _ = require('underscore');

    var EntryHistories = require('app/js/admin/collections/EntryHistories');
    var Categories = require('app/js/admin/collections/Categories');
    var Files = require('app/js/admin/collections/Files');
    var ButtonView = require('app/js/admin/views/ButtonView');
    var EntryPreviewModalView = require('app/js/admin/views/entries/EntryPreviewModalView');
    var AmazonSearchView = require('app/js/admin/views/entries/AmazonSearchView');
    var FileUploadView = require('app/js/admin/views/entries/FileUploadView');
    var ErrorHandler = require('app/js/admin/views/ErrorHandler');
    var AutoCompleteView = require('app/js/admin/views/AutoCompleteView');

    var entryForm = require('text!app/js/admin/templates/entries/entryForm.hbs');
    var entryShow = require('text!app/js/admin/templates/entries/entryShow.hbs');
    var entryTable = require('text!app/js/admin/templates/entries/entryTable.hbs');
    var amazonBookInserted = require('text!app/js/admin/templates/entries/amazonBookInserted.hbs');
    var fileInserted = require('text!app/js/admin/templates/entries/fileInserted.hbs');

    return Backbone.View.extend(_.extend({
        events: {
            'click #btn-entry-confirm': '_confirm',
            'click #btn-entry-back-to-form': 'render',
            'click #btn-entry-update-form': '_updateForm',
            'click #btn-entry-create': '_create',
            'click #btn-entry-update': '_update',
            'click #btn-entry-delete': '_delete',
            'click #btn-entry-preview': '_preview',
            'click #btn-entry-apply-history': '_applyHistory',
            'show.bs.tab #contents-tab > ul a': '_tabShow'
        },
        bindings: {
            '#title': 'title',
            '#categoryString': 'categoryString',
            '#wmd-input': 'contents',
            '#format': 'format',
            '#published': 'published',
            '#updateLastModifiedDate': 'updateLastModifiedDate',
            '#saveInHistory': 'saveInHistory'
        },

        entryFormTemplate: Handlebars.compile(entryForm),
        entryShowTemplate: Handlebars.compile(entryShow),
        entryTableTemplate: Handlebars.compile(entryTable),
        amazonBookInsertedTemplate: Handlebars.compile(amazonBookInserted),
        fileInsertedTemplate: Handlebars.compile(fileInserted),

        initialize: function () {
            if (this.model.id) {
                this.templateOpts = {
                    update: true
                };
                this.entryHistories = new EntryHistories().entry(this.model);
                this.listenTo(this.entryHistories, 'sync', this._appendEntryHistoryTable);
            } else {
                this.templateOpts = {
                    create: true
                };
            }
            this.listenTo(this.model, 'change:contents change:format', this._renderContents);
            this.categories = new Categories();
        },
        render: function () {
            this.$el.empty().html(this.entryFormTemplate(
                _.merge(this.model.toJSON(), this.templateOpts)
            ));

            Backbone.Validation.bind(this);
            this.stickit();
            if (this.entryHistories) {
                this.entryHistories.fetch();
            }
            return this;
        },
        showAutoComplete: function () {
            new AutoCompleteView({
                input: this.$("#categoryString"),
                queryParameter: 'keyword',
                model: this.categories,
                onSelect: function (model) {
                    console.log(model);
                }
            }).render();
            return this;
        },
        show: function () {
            this.$el.empty().html(this.entryShowTemplate(
                _.merge(this.model.toJSON(), {show: true})
            ));
            return this;
        },
        showPagedownEditor: function () {
            var converter = new Markdown.Converter();
            var editor = new Markdown.Editor(converter);
            editor.run();
            return this;
        },
        _appendEntryHistoryTable: function () {
            this.$el.append(this.entryTableTemplate({
                content: this.entryHistories.toJSON(),
                history: true
            }));
        },
        _confirm: function () {
            if (!this.model.isValid(true)) {
                return false;
            }

            this.$el.empty().html(this.entryShowTemplate(
                _.merge(this.model.toJSON(), this.templateOpts)
            ));
            this.buttonView = new ButtonView({
                el: this.$('.btn')
            });
            return false;
        },
        _updateForm: function () {
            Backbone.history.navigate('entries/' + this.model.id + '/form');
            this.render();
            this.showPagedownEditor().showAutoComplete();
            return false;
        },
        _create: function () {
            this.model.save()
                .done(_.bind(function () {
                    Backbone.history.navigate('entries', {
                        trigger: true
                    });
                }, this)).fail(_.bind(this.handleError, this));
            return false;
        },
        _update: function () {
            this.model.save()
                .done(_.bind(function () {
                    Backbone.history.navigate('entries/' + this.model.id, {
                        trigger: true
                    });
                }, this)).fail(_.bind(this.handleError, this));
            return false;
        },
        _delete: function () {
            if (confirm('Are you really delete?')) {
                this.model.destroy()
                    .done(_.bind(function () {
                        Backbone.history.navigate('entries', {
                            trigger: true
                        });
                    }, this)).fail(_.bind(function (response) {
                        console.log(response);
                        this.showErrors(response.responseJSON);
                    }, this));
            }
        },
        _preview: function () {
            var modalView = new EntryPreviewModalView(this.model);
            this.$el.append(modalView.render().el);
            modalView.show();
            if (this.buttonView) {
                this.buttonView.enable();
            }
        },
        _applyHistory: function (e) {
            var $btn = $(e.currentTarget);
            var history = this.entryHistories.get($btn.data('entry-history-id'));
            this.model.set({
                title: history.get('title'),
                contents: history.get('contents'),
                format: history.get('format')
            });
            return false;
        },
        _tabShow: function (e) {
            this.contentsTab = e.target.hash;
            this._renderContents();
        },
        _renderContents: function () {
            if (this.contentsTab === '#contents-tab-preview') {
                // refresh
                this.model.set('contents', this.$('#wmd-input').val());
                this.$(this.contentsTab)
                    .empty().html(this.model.getFormattedContents());
            } else if (this.contentsTab === '#contents-tab-fileupload') {
                if (!this.fileUploadView) {
                    var files = new Files();
                    this.fileUploadView = new FileUploadView({
                        collection: files
                    });
                    this.listenTo(this.fileUploadView, 'fileSelected', this._onFileSelected);
                    this.$(this.contentsTab)
                        .empty().html(this.fileUploadView.render().el);
                }
                this.fileUploadView.collection.fetch();
            } else if (this.contentsTab === '#contents-tab-amazon') {
                if (!this.amazonSearchView) {
                    this.amazonSearchView = new AmazonSearchView();
                    this.listenTo(this.amazonSearchView, 'bookSelected', this._onBookSelected);
                    this.$(this.contentsTab)
                        .empty().html(this.amazonSearchView.render().el);
                }
                //this.amazonSearchView.focus();
            }
        },
        _onBookSelected: function (book) {
            this.model.appendContents(this.amazonBookInsertedTemplate(book.toJSON()));
        },
        _onFileSelected: function (file) {
            this.model.appendContents(this.fileInsertedTemplate(file.toJSONForView()));
        }
    }, ErrorHandler));
});