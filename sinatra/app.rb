# /public	静的ファイル(css, img, js)を配置する
# /views	動的ファイル(erb)を配置する
# app.rb	メインアプリケーション
#
require 'sinatra'
require 'sinatra/reloader'
require 'active_record'
require 'mysql2'
require 'bitly'

# DB設定ファイルの読み込み
ActiveRecord::Base.configurations = YAML.load_file('config/database.yml')
ActiveRecord::Base.establish_connection(:development)
ActiveRecord::Base.logger = Logger.new("log/sql.log")

class QUser < ActiveRecord::Base
  has_many :Question
  has_secure_password

  validates_presence_of :name
  validates_presence_of :password
  validates_presence_of :q_hash
  validates_uniqueness_of :q_hash
end

class AUser < ActiveRecord::Base
  has_many :Answer
  validates_presence_of :name
  validates_presence_of :q_user_id
end

class Question < ActiveRecord::Base
  validates_presence_of :content
end

class Answer < ActiveRecord::Base
  validates_presence_of :content
  validates_uniqueness_of :a_user_id, scope: :q_id
end

class AnswerDecorations < ActiveRecord::Base
end

class App < Sinatra::Base
  configure :development do
    register Sinatra::Reloader
  end

  enable :sessions

  helpers do
    def bitly_shorten(url)
      Bitly.use_api_version_3
      Bitly.configure do |config|
        config.api_version = 3
        config.access_token = ""
      end
      Bitly.client.shorten(url).short_url
    end
  end

  get '/' do
    @title = 'Top'
    @top = true
    erb :index
  end

  # ------------ Questioner --------------
  get '/q/qr/:q_hash' do
      url = "https://qnaj.xyz/"
    @q = true
    @short_url = bitly_shorten url + "a/login/" + params[:q_hash]
    erb :'q/qr', :layout => :none
  end

  get '/q' do
    @q = true
    @title = 'Q'
    if (session[:q_user_id].nil?)
      redirect '/q/login'
    end

    question = Question.find_by(q_user_id: session[:q_user_id], public: true)
    p question 

    @q_user_id = session[:q_user_id]
    @name = session[:name]
    @q_hash = session[:q_hash]
    erb :'q/index'
  end

  get '/q/login' do
    @title = 'Q Login'
    erb :'q/login'
  end

  post '/q/login' do
    @title = 'Q Login'

    user = QUser.find_by(name: params[:name])

    session[:a_user_id] = nil
    if (!user.nil? && user.authenticate(params[:password]))
      # login success
      session[:q_user_id] = user.id
      session[:name] = user.name
      session[:q_hash] = user.q_hash
      redirect '/q'
    else
      # login failed
      qHash = SecureRandom.uuid
      qUser = QUser.new(
        name: params[:name],
        password: params[:password],
        password_confirmation: params[:password],
        q_hash: qHash
      )
      if (qUser.save)
        session[:q_user_id] = qUser.id
        session[:name] = params[:name]
        session[:q_hash] = qHash
        redirect '/q'
      end
    end

    @error = 'ERROR!!'
    erb :'q/login'
  end

  # add questions
  post '/q/reg' do
    question = Question.new(
      q_user_id: params[:q_user_id],
      content: params[:content],
      public: false
    )
    if (question.save)
      status 200
    else
      status 500
    end
  end

  # add questions
  post '/q/update' do
    questions = Question.where(q_user_id: session[:q_user_id])
    chkUpdate = questions.update_all(public: false)
    if (chkUpdate)
      chkUpdateT = Question.find(params[:q_id]).update(public: true)
    end
    if (!chkUpdateT.nil?)
      status 200
    else
      status 500
    end
  end

  # get questions list
  get '/q/list/:q_hash' do
    content_type :json
    if (!session[:q_user_id].nil? && session[:a_user_id].nil?)
      QUser.find_by(q_hash: params[:q_hash]).Question.to_json
    else
      QUser.joins(:Question).select("q_users.*", "questions.*").find_by(
          "q_users.q_hash" => params[:q_hash],
          "questions.public" => true
      ).to_json
    end
  end

  # ------------ Answer --------------
  get '/a/:q_hash' do
    @a = true
    # TODO: security csrf
    @title = 'A'
    @q_hash = params[:q_hash]
    @a_user = AUser.find(session[:a_user_id])
    @q_user = QUser.find_by(q_hash: params[:q_hash])

    erb :'a/index'
  end

  get '/a/list/:q_id' do
    content_type :json
    if (!session[:q_user_id].nil? && session[:a_user_id].nil?)
      answers = []
      AUser.joins(:Answer).select("a_users.*", "answers.*").where(
        "a_users.q_user_id" => session[:q_user_id],
        "answers.q_id" => params[:q_id]
      ).each do |ans|
        answers << ans
      end 
      answers.to_json
    else
      Answer.find_by(
        a_user_id: session[:a_user_id],
        q_id: params[:q_id]
      ).to_json 
    end
  end

  get '/a/list/all/:q_id' do
    content_type :json
    Answer.where(
      "answers.q_id" =>  params[:q_id],
      "answers.public" => true
    ).to_json()
  end


  post '/a/update' do
    answer = Answer.find(params[:a_id])
    answer.public = true
    answer.public_type = (params[:color] === "B")? 1 : 2;
    if (answer.save)
      status 200
    else
      status 500
    end
  end

  # add answers
  post '/a/reg' do
    answer = Answer.find_or_initialize_by(
      a_user_id: params[:a_user_id],
      q_id: params[:q_id],
    )
    answer.content = params[:content]
    answer.public = false
    p answer
    if (answer.save)
      status 200
    else
      status 500
    end
  end

  get '/a/login/:q_hash' do
    @title = 'A Login'
    @q_hash = params[:q_hash]
    @q_user =  QUser.find_by(q_hash: params[:q_hash])
    erb :'a/login'
  end

  post '/a/login' do
    qUser = QUser.find_by(q_hash: params[:q_hash])
    aUser = AUser.new(
      name: params[:name],
      q_user_id: qUser.id
    )
    if (aUser.save)
      session[:a_user_id] = aUser.id
      session[:name] = params[:name]
      session[:q_user_id] = nil
      redirect '/a/' + params[:q_hash]
    else
      redirect '/a/login/' + params[:q_hash]
    end
  end
end
